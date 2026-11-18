# Standalone surveys

Surveys not tied to a course, as an alternative to E-lomake. Respondents get a secret link from outside Norppa and log in with Shibboleth.

## Behaviour

- Admins create and delete surveys (not once answered) and pick the responsible persons (at least one). Responsible persons edit the survey, see all results and hide open answers. Their surveys are listed in Kyselyni.
- The link is `/survey/<token>/<slug>`. The token never changes; the slug comes from the Finnish name and is cosmetic, so a wrong one redirects.
- Anyone who can log in with Shibboleth can answer. Users without Sisu data get a Norppa user on first login.
- Answering is open between `opens_at` and `closes_at`. Once `opens_at` has passed, only admins can change it or the questions; responsible persons can still change question visibility.
- One answer per person, editable or removable while open. `user_id` is stored only to enforce this and is never exposed.
- Questions are `PUBLIC` or `PRIVATE`. Respondents see public results after answering, and anyone with the link sees them once the survey has closed. Open answers can be made public only after closing, enforced on the server. No minimum answer count, no emails.
- One optional grouping question, with options written by the managers instead of Sisu groups. Results can be filtered by it; the server filters before shuffling, so a response's answers still can't be linked.

## Code

- Server: `src/server/routes/standaloneSurveys/`, `src/server/services/standaloneSurveys/`
- Client: `src/client/pages/StandaloneSurvey/` and the admin tab `src/client/pages/Admin/tabs/StandaloneSurveys/`
- Migration `20261103_00_create_standalone_surveys.js`, e2e `e2e/specs/standaloneSurvey.spec.ts`

Respondent routes (`/answer/:token/...`) never return user ids or anything identifying an answer. Management routes (`/:id/...`) go through `assertCanManage`.

Questions are rows in the shared `questions` table, linked through `standalone_survey_questions`. Removing a question leaves its `questions` row, since answers refer to it. `standalone_survey_responses.data` has the same shape as `feedbacks.data`. A hidden open answer stays hidden when its respondent re-saves the same text.

## Shared with course feedback

Many components and server utils were made to work without a feedback target, e.g. `FormContainer`, `QuestionEditor`, `OrderedQuestionResults`, `useOpenAnswerActions`, `validateAnswers` and `shuffleFeedbacks`. Changes to them affect both.

`TranslationContextProvider value="standalone"` makes shared components use a `key_standalone` translation when one exists. Standalone-only texts are in the `standaloneSurvey` namespace.
