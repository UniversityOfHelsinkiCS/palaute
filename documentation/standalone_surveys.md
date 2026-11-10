# Standalone surveys

Surveys not tied to a course, as an alternative to E-lomake. An admin creates the survey and picks its responsible persons (`responsible_users`). Respondents get a secret link from outside Norppa and log in with Shibboleth.

## Behaviour

- Admins create and delete surveys and can do everything else. A survey with answers can't be deleted.
- Responsible persons edit the survey, see all results and hide open answers. Only admins delete open answers. A survey always has at least one responsible person, and being one gives the Kyselyni menu item (`preferences.ts`); their surveys are listed there under "Muut kyselyt".
- The link is `/survey/<token>/<slug>`. The token is 12 random characters and never changes. The slug comes from the Finnish name and is cosmetic: a wrong one redirects.
- Anyone who can log in with Shibboleth can answer. Users without Sisu data get a Norppa user on first login.
- Answering is open between `opens_at` and `closes_at`; to stop a survey, move `closes_at`. Once `opens_at` has passed, only admins can change it or the questions; responsible persons can still change question visibility.
- One answer per person, with at least one question answered. It can be edited or removed while the survey is open. `user_id` is stored only to enforce this and is never shown.
- Questions are `PUBLIC` or `PRIVATE`. Respondents see public results after answering while the survey is open, and anyone with the link sees them once it has closed. No minimum answer count.
- Same question types as courses. A survey can have one grouping question, as in courses but with no Sisu groups: the managers write its options. Managers can filter the results by its answer; the server filters before shuffling, which separates a response's answers. No emails.

## Code

- Server: `src/server/routes/standaloneSurveys/` and `src/server/services/standaloneSurveys/`
- Client: `src/client/pages/StandaloneSurvey/` (`AnswerSurvey.jsx` respondent page, `manage/` management page) and the admin tab `src/client/pages/Admin/tabs/StandaloneSurveys/`
- Migration `20261103_00_create_standalone_surveys.js`, e2e `e2e/specs/standaloneSurvey.spec.ts`

Respondent routes (`/answer/:token/...`) never return user ids or anything identifying an answer. Management routes (`/:id/...`) go through `assertCanManage`.

## Data

- `standalone_surveys`: name, token, dates
- `standalone_survey_questions`: links a row in the shared `questions` table to a survey, with `position` and `visibility`
- `standalone_survey_responsible_users`
- `standalone_survey_responses`: `data` in the same shape as `feedbacks.data`, unique per survey and user
- `standalone_survey_logs`: name and date changes, added and removed questions, visibility changes, responsible persons

Removing a question leaves its `questions` row, since answers refer to it. A hidden open answer stays hidden when its respondent re-saves the same text.

## Shared with course feedback

These were made usable without a feedback target, so changes affect both:

- `FormContainer` (extracted from `FeedbackView`), `QuestionResults`, `ExportFeedbacksMenu`, `ChartTableToggle`, `QuestionEditor`, `GroupingQuestionSettings`, `GroupSelector` and `useOpenAnswerActions`
- Server: `validateAnswers`, `shuffleFeedbacks.ts`, `openAnswers.ts` and `groupingQuestion.ts` in `src/server/util/`

Where course wording doesn't fit, `TranslationContextProvider value="standalone"` makes shared components use a `key_standalone` translation when one exists. Standalone-only texts are in the `standaloneSurvey` namespace.
