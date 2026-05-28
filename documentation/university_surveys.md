# University surveys

## Overview

The university survey is the set of questions that appears on every feedback form across the entire university. All course realisations share these questions, in addition to any programme- or teacher-level questions.

There is exactly one university survey active at any given time, but multiple versions can exist in the database — each with a `valid_from` date indicating when it took effect. The version with the greatest `valid_from` that is ≤ a given reference date is considered active for that date. A survey with `valid_from = NULL` is treated as "valid from the beginning of time" and acts as a fallback for all dates before any versioned survey exists.

The decision for which university survey is used for a feedback target is made by the FBT's `opensAt` date.

## Publicity rules

Numeric (LIKERT, SINGLE_CHOICE) university questions are always public — their `id`s are set as `publicQuestionIds` on the survey object. Open-text university questions are non-public by default but can be made public by teachers or programmes. Programmes and teachers cannot change the publicity of numeric university questions.

## Creating a new version

Admins can create a new version via the admin panel with a `validFrom` date in the future. The endpoint clones all questions from the most recent version (except the workload question, which is shared by id across versions) and creates a new survey row. The admin can then edit that survey's questions before the cutover date.

### Workload question

The workload question id is configured via the global `WORKLOAD_QUESTION_ID` variable in `config/`. This is a bit of a legacy decision, should probably be refactored away in the future.

## Course summary display

In the standard (year-filtered) summary views, the column headers shown are the questions from the university survey effective at the start of the selected academic year. When a CU page is viewed in "all time" mode, feedback targets are grouped by the survey version that applies to them.
