# University surveys

## Overview

The university survey is the set of questions that appears on every feedback form across the entire university. All course realisations share these questions, in addition to any programme- or teacher-level questions.

There is exactly one university survey active at any given time, but multiple versions can exist in the database — each with a `valid_from` date indicating when it took effect. The version with the greatest `valid_from` that is ≤ a given reference date is considered active for that date. A survey with `valid_from = NULL` is treated as "valid from the beginning of time" and acts as a fallback for all dates before any versioned survey exists.

## Database representation

University surveys are rows in the `surveys` table with `type = 'university'`. The `valid_from` column (nullable `DATE`) drives version selection. There is no `valid_until` — a version is implicitly superseded when a newer one's `valid_from` is reached.

```
surveys
  id          serial PK
  type        'university'
  type_id     string  (used as a namespace, shared across versions of the same survey)
  question_ids integer[]
  valid_from  date | NULL
```

## Version selection

`getUniversitySurvey(referenceDate)` in `src/server/services/surveys/universitySurvey.ts` implements the version lookup:

```sql
SELECT * FROM surveys
WHERE type = 'university'
  AND (valid_from IS NULL OR valid_from <= :referenceDate)
ORDER BY valid_from DESC NULLS LAST
LIMIT 1
```

The reference date is always the FBT's `opensAt` — i.e. when the feedback period began — not the current date. This means feedback collected under an older survey version is always presented with that version's questions, even after a newer version has been deployed.

## Where the reference date comes from

- **Feedback forms** (`getFeedbackTargetSurveys`): uses `feedbackTarget.opensAt`
- **Course summary column headers**: the client sends `?at=<start-of-selected-year>` to `/surveys/university` or `/surveys/organisation/:code`
- **Course-unit-group "all time" view**: `getCourseUnitGroupSummaries` calls `getAllUniversitySurveys` and assigns each FBT to the version effective at its `opensAt`, producing separate grouped sections per version

## Publicity rules

Numeric (LIKERT, SINGLE_CHOICE) university questions are always public — their `id`s are set as `publicQuestionIds` on the survey object. Open-text university questions are non-public by default but can be made public by teachers or programmes. Programmes and teachers cannot change the publicity of numeric university questions.

## Creating a new version

Admins can create a new version via `POST /surveys/university` with a `validFrom` date in the future. The endpoint clones all questions from the most recent version (except the workload question, which is shared by id across versions) and creates a new survey row. The admin can then edit that survey's questions before the cutover date.

## Course summary display

In the standard (year-filtered) summary views, the column headers shown are the questions from the university survey effective at the start of the selected academic year. When a course-unit-group page is viewed in "all time" mode, feedback targets are grouped by the survey version that was active when they opened, and each group gets its own question columns and a year-range label (e.g. `2024–2025`, `2025–`).
