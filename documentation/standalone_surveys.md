# Standalone surveys

Surveys that aren't tied to a course, as an alternative to E-lomake. An admin creates the survey and names its responsible persons, who edit it and see the results. The people who should answer get a secret link from outside Norppa and log in with Shibboleth to answer.

## Behaviour

- Only admins create and delete surveys, and they can do everything else too. A survey with answers can't be deleted.
- Responsible persons ("Vastuuhenkilöt" / "Ansvariga personer" / "Responsible persons", `responsible_users` in code) edit the survey and its responsible persons, see all results and hide open answers. Only admins can delete an open answer's text. There's always at least one responsible person.
- Responsible persons find their surveys on Kyselyni (`/courses`) under "Muut kyselyt". Being one is enough to get the Kyselyni menu item (`src/server/services/users/preferences.ts`).
- Respondents reach a survey only through its link, `/survey/<token>/<slug>`. Anyone who can log in with Shibboleth can answer, including people with no Sisu data: login creates a Norppa user for them. The token is 12 random characters and never changes. The slug is made from the Finnish name and is only for reading: a wrong or missing slug redirects to the current one.
- Answering is open between `opens_at` and `closes_at`. There's no disabled state: a survey is stopped by moving `closes_at`. Once a survey has opened, only admins can change `opens_at` or the questions' content; responsible persons can still change question visibility.
- One answer per person, with at least one question answered. It can be edited and removed while the survey is open.
- `user_id` is stored with each answer only to enforce one answer per person. Nobody can see who answered.
- Results have no minimum answer count. Answers are shuffled per question, as for courses.
- A question's results are `PUBLIC` or `PRIVATE`. Respondents see `PUBLIC` results while the survey is open only after answering, and after it closes anyone with the link sees them.
- No emails.
- Names and questions in fi/sv/en, falling back like courses. Question types are the course ones minus `GROUPING`; intro text is a `TEXT` question.

## Code

- Server: `src/server/routes/standaloneSurveys/` (mounted at `/standalone-surveys`) and `src/server/services/standaloneSurveys/`.
- Client: `src/client/pages/StandaloneSurvey/`. `AnswerSurvey.jsx` is the respondent page, `manage/` the management page at `/standalone-surveys/:id`, and `StandaloneSurveyGroup.jsx` the section on Kyselyni. The admin tab is `src/client/pages/Admin/tabs/StandaloneSurveys/`.
- Migration: `src/server/migrations/20261103_00_create_standalone_surveys.js`.
- E2E: `e2e/specs/standaloneSurvey.spec.ts`.

Respondent routes use the token (`/standalone-surveys/answer/:token/...`) and never return user ids, other answers' ids or timestamps. Management routes use the survey id and check `assertCanManage` in `access.ts`.

## Data

| Table                                 | Holds                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `standalone_surveys`                  | `name` (JSONB), `token`, `opens_at`, `closes_at`, `created_by_user_id`                                           |
| `standalone_survey_questions`         | Links a row in the shared `questions` table to a survey, with `position` and `visibility` (`PUBLIC` / `PRIVATE`) |
| `standalone_survey_responsible_users` | Survey and user, unique together                                                                                 |
| `standalone_survey_responses`         | Survey, user and `data` (`QuestionAnswer[]`, same shape as `feedbacks.data`), unique per survey and user         |
| `standalone_survey_logs`              | Changes to name, dates, questions and responsible persons                                                        |

Removing a question deletes only its `standalone_survey_questions` row; the `questions` row stays because answers refer to it by id. When a respondent edits their answer, open answers a manager has hidden stay hidden as long as their text is unchanged.

## Shared with course feedback

The respondent form, results, question editor and export are the course components, made independent of `FeedbackTargetContext`. Changes to these affect both:

- `FormContainer`, `FeedbackForm` and `ErrorSummary` in `src/client/pages/FeedbackTarget/tabs/FeedbackView/`. Standalone passes `showInfo={false}`.
- `QuestionResults` and its children: publicity and open-answer actions come in as props. `useOpenAnswerActions` (`src/client/hooks/`) does the hiding and deleting for both.
- `ChartTableToggle`, `ExportFeedbacksMenu` and `QuestionEditor`.
- On the server, in `src/server/util/`: `validateAnswers` (`feedbackValidator.ts`), `shuffleFeedbacks.ts` and `openAnswers.ts` (hiding and deleting open answers by their text).

Where the course wording doesn't fit, the shared components use the i18next context `standalone`: `TranslationContextProvider value="standalone"` in `src/client/util/translationContext.ts` makes `t(key, { context })` pick `key_standalone` when it exists. Standalone-only texts are in the `standaloneSurvey` namespace.
