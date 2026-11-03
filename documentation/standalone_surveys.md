# Standalone surveys

Surveys that aren't tied to courses, meant as an alternative to E-lomake. Admins create them, and the people who should answer get a secret link from outside Norppa. Answering requires Shibboleth login.

Status: implemented on master (not pushed). The e2e spec hasn't been run yet.

## Decisions

- Separate tables. No fake course, course realisation or feedback target.
- Only admins create surveys. Admins see and can do everything.
- Responsible users ("Responsible persons" / "Vastuuhenkilöt" / "Ansvariga personer" in the UI) edit the survey and see results. Responsible users and admins add and remove them, and there's always at least one. The creating admin is prefilled in the creation form and can be removed.
- Responsible users find their surveys on "My surveys" (`/courses`, `MyTeaching`) under their own heading. Respondents find surveys they've answered on "My feedback" (`/feedbacks`, `MyFeedbacks`). Surveys nobody has answered are reachable only through the link.
- The link carries a random token that never changes. There's no disabled state. A survey is stopped by setting `closes_at` to now.
- One answer per person. Answers can be edited and deleted until the survey closes.
- No list of who answered. `user_id` is stored only to prevent duplicates and allow editing.
- No minimum answer count for results. Answers are shuffled per question, as for courses.
- `PUBLIC` question results: while open, only to people who have answered; after close, anyone with the link. Checked on the server.
- No emails of any kind.
- All of fi/sv/en. Missing translations fall back like courses. Intro text is a `TEXT` question.
- Question types are the same as courses, minus `GROUPING`. Editing questions locks the same way as courses.
- Admins can delete a survey only when it has no answers.
- `closes_at` can be changed at any time. `opens_at` is locked once the survey is open.
- Generic privacy notice.
- Logged-in users who resolve to the `NO_USER_USERNAME` placeholder can't answer. Login will create Norppa users for people without Sisu data (separate work), but the check stays as a guard.
- No feature flag. Nothing shows up until an admin creates a survey.

Out of scope for now: copying surveys, counter feedback, a list of who answered, summaries.

## Schema

One migration, `src/server/migrations/<date>_00_create_standalone_surveys.js`, creates all tables. Models go in `src/server/models/`, with associations in `src/server/models/index.ts`.

| Table                                 | Columns                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `standalone_surveys`                  | `id`, `name` JSONB, `token` VARCHAR UNIQUE, `opens_at`, `closes_at` (both NOT NULL), `created_by_user_id` FK users, timestamps                                                                       |
| `standalone_survey_questions`         | `id`, `standalone_survey_id` FK CASCADE, `question_id` FK questions UNIQUE, `position` INTEGER, `visibility` ENUM('PUBLIC', 'PRIVATE') default `PRIVATE`, timestamps. INDEX (`standalone_survey_id`) |
| `standalone_survey_responsible_users` | `id`, `standalone_survey_id` FK CASCADE, `user_id` FK users, timestamps. UNIQUE (`standalone_survey_id`, `user_id`), INDEX (`user_id`)                                                               |
| `standalone_survey_responses`         | `id`, `standalone_survey_id` FK CASCADE, `user_id` FK users, `data` JSONB (`QuestionAnswer[]`, same as `feedbacks.data`), timestamps. UNIQUE (`standalone_survey_id`, `user_id`)                     |
| `standalone_survey_logs`              | `id`, `standalone_survey_id` FK CASCADE, `user_id` FK users, `data` JSONB, timestamps. INDEX (`standalone_survey_id`)                                                                                |

Removing a question from a survey deletes its `standalone_survey_questions` row but keeps the `questions` row, because answers refer to it by id.

## Access

|                                                | Admin | Responsible user | Has answered | Has the link |
| ---------------------------------------------- | ----- | ---------------- | ------------ | ------------ |
| Create, list all, delete (no answers)          | yes   |                  |              |              |
| Edit name, dates, questions, responsible users | yes   | yes              |              |              |
| See all results, hide open answers, export     | yes   | yes              |              |              |
| Delete open answer content                     | yes   |                  |              |              |
| Answer, edit and delete own answer while open  | yes   | yes              | yes          | yes          |
| See `PUBLIC` results while open                | yes   | yes              | yes          |              |
| See `PUBLIC` results after close               | yes   | yes              | yes          | yes          |

Management endpoints use the survey's `id`. Respondent endpoints use the `token` and never return `user_id`s, `id`s of other answers or timestamps.

## Server

New code in `src/server/services/standaloneSurveys/` and `src/server/routes/standaloneSurveys/`, mounted as `/standalone-surveys` in `src/server/routes/routes.ts`.

Respondent routes, by token:

- `GET /standalone-surveys/answered`: surveys the user has answered, with their tokens (for My feedback)
- `GET /standalone-surveys/answer/:token`: name, dates, questions, the user's own answer, and whether results are visible
- `PUT /standalone-surveys/answer/:token/response`: create or update the own answer. Checks: survey open, not the placeholder user, answers valid.
- `DELETE /standalone-surveys/answer/:token/response`
- `GET /standalone-surveys/answer/:token/results`: shuffled `PUBLIC` results, by the rules above

Management routes, by id (admin or responsible user):

- `GET /standalone-surveys`: surveys the user is responsible for (for My surveys)
- `GET /standalone-surveys/:id`, `PUT /standalone-surveys/:id`: name and dates
- `PUT /standalone-surveys/:id/questions`: questions, order and visibility
- `PUT /standalone-surveys/:id/responsible-users`
- `GET /standalone-surveys/:id/results`: all questions, shuffled
- `PUT /standalone-surveys/:id/hide-answer`, `PUT /standalone-surveys/:id/delete-answer` (admin only)
- `GET /standalone-surveys/:id/logs`

Admin routes:

- `GET /standalone-surveys/all`, `POST /standalone-surveys`, `DELETE /standalone-surveys/:id`

An access helper returns `{ isAdmin, isResponsibleUser }` for a user and survey, and every management route checks it. Changes to name, dates, questions and responsible users are logged.

## Client

New code in `src/client/pages/StandaloneSurvey/`.

- `/survey/<token>-<slug>`: the respondent page. The slug comes from the name (Finnish first) and is only for reading; the token is the first 32 characters, and a wrong or missing slug redirects to the current one. `FeedbackForm`, `ErrorSummary` and `PrivacyDialog` reused, plus results (`QuestionResults`) when visible.
- `/standalone-surveys/:id/*`: the management page, built from the same layout and tab components as `/targets/:id`. Tabs: Survey (preview), Results, Edit (name, dates, `QuestionEditor`), Responsible persons, Share (copy link), Logs.
- Admin panel: a new "Standalone surveys" tab in `src/client/pages/Admin/Admin.jsx` with the list of all surveys and the creation form. The responsible persons picker reuses `ResponsibleTeachersSelector` from `src/client/pages/Organisation/OrganisationSurveyEditor.jsx`.
- My surveys (`src/client/pages/MyTeaching/`): a heading listing the surveys the user is responsible for, shown only when there are any.
- My feedback (`src/client/pages/MyFeedbacks/`): the surveys the user has answered, linking to the answer page, shown only when there are any.

`QuestionEditor` is already configured through props: without `groupingQuestionSettings` and `copyFromCourseDialog` it offers no grouping or copying. `FeedbackChart` isn't used, because its response rate needs an expected respondent count. The results page shows the answer count instead.

New translations go in `public/locales/{fi,sv,en}/translation.json` under their own namespace. Existing keys are reused where the wording fits.

## Changes to existing code

Each change is its own commit, made before the code that needs it, and course behaviour must stay the same.

1. `src/server/services/feedbackTargets/getFeedbacks.ts`: move `shuffleFeedbacks` to a shared util and export it.
2. `src/server/util/feedbackValidator.ts`: split `validateFeedback(data, feedbackTarget)` into a function that validates answers against a list of questions, plus the existing course wrapper that loads the course's questions.
3. `src/client/pages/FeedbackTarget/tabs/FeedbackView/utils.js`: `getInitialValues(feedbackTarget)` takes the questions and the existing answer instead of a feedback target.
4. `src/client/pages/FeedbackTarget/tabs/Results/QuestionResults/`: `OpenResults`, `useUpdateOpenFeedbackVisibility`, `useDeleteOpenFeedback` and `QuestionItem` stop reading `FeedbackTargetContext` and calling `/feedback-targets` endpoints themselves. `QuestionResults` takes the hide, delete and publicity handlers as props, and the course results page passes the current ones.
5. `src/client/pages/FeedbackTarget/tabs/Results/ExportFeedbacksMenu.jsx`: take the file name as a prop instead of building it from the course code and start date.
6. `src/server/services/feedbackTargets/hideFeedback.ts`: the part that hides or removes matching open answers is extracted to `src/server/util/openAnswers.ts`.
7. `src/client/pages/FeedbackTarget/tabs/FeedbackView/FeedbackView.jsx`: `FormContainer` moved to its own file, with an optional `infoText`. `PrivacyDialog` takes optional `content`.
8. `src/client/pages/Organisation/OrganisationSurveyEditor.jsx`: `ResponsibleTeachersSelector` is exported and uses its `name` prop instead of a hard-coded `teachers` field.
9. `ShareItem` (Share tab) and `getLogMessage` (Logs tab) are exported.
10. `src/server/services/users/preferences.ts`: responsible users of standalone surveys get the My surveys menu item.
11. `MyTeaching.jsx` and `MyFeedbacks.tsx` render the standalone survey sections.

The shared components stay in `src/client/pages/FeedbackTarget/`, because the guest pages already import them from there.

## Order

Each step is committed to master. The work isn't visible to users until the admin tab lands.

1. Migration, models, associations
2. Server refactors 1–2
3. Server: access helper, admin routes, management routes, respondent routes
4. Test data seeding for the new tables in `src/server/test/`
5. Client refactors 3–7
6. Client: respondent page
7. Client: management page
8. Client: admin tab, My surveys and My feedback headings
9. Playwright spec `e2e/specs/standaloneSurvey.spec.ts`

## Tests

The Playwright spec covers:

- An admin creates a survey and a responsible user edits its questions.
- A respondent answers through the link, edits and deletes the answer, and can't answer twice.
- `PUBLIC` results visibility while open and after close.
- Answering is refused before `opens_at`, after `closes_at`, and for the placeholder user.
- A responsible user of one survey can't open another survey's management routes.

The existing specs must keep passing, especially `feedbackResults.spec.ts`, `teacherview.spec.ts` and `organisationSurvey.spec.ts`, which cover the refactored components.
