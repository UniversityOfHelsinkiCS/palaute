# Known bugs

Found while writing the help chatbot's knowledge document (September 2026) and checked against the code. Paths starting with `updater/` are in the [norppa-updater](https://github.com/UniversityOfHelsinkiCS/norppa-updater) repository, the rest in this one. Remove an entry once it's fixed. This doc has been written up by an AI agent, not manually checked, so take it with a grain of salt.

## Behaviour

### The updater moves the dates of open and closed surveys

`updater/src/updater/updateCoursesAndTeacherFeedbackTargets/updateCoursesAndTeacherFeedbackTargets.js:257-290`

Every night, feedback targets whose dates were never edited in Norppa (`feedbackDatesEditedByTeacher` is false) get `opensAt` and `closesAt` recalculated from Sisu, whether or not feedback has already opened. When the course end date in Sisu moves, an open survey can become "not yet open" again, and a closed one can reopen.

Fix: don't update the dates once `opensAt` has passed.

### A single Sisu study sub-group still becomes a group

`updater/src/updater/updateCoursesAndTeacherFeedbackTargets/createStudyGroups.js:22`

`!studySubGroups?.length > 1` parses as `(!length) > 1`, which is always false. So study group sets with only one sub-group still create groups, and teachers get a pointless group filter. The `return` there also exits the whole callback, so fixing only the condition would skip the remaining study group sets.

Fix: `if ((studySubGroups?.length ?? 0) <= 1) continue`, or the equivalent in a loop.

### Survey questions can be changed after the survey has opened

`src/server/services/feedbackTargets/update.ts:178-195`

Only the client locks the Questions tab once feedback opens (`FeedbackTargetContent.jsx:175`). The server accepts question changes at any time, so answered questions can be removed or changed.

Fix: reject `questions` for non-admins once `opensAt` has passed.

### Organisation surveys with answers can be deleted

`src/server/routes/organisations/organisationSurveyController.ts:165-185`

The handler already throws when the user isn't an organisation admin, so the later check `!hasAdminAccess && !allowDelete` is always false. Deleting a survey that has answers is never blocked on the server; only the UI hides the Remove button.

Fix: `if (!allowDelete && !user.isAdmin) throw Forbidden`.

### Saving an empty counter feedback fails, and the email is sent before saving

`src/server/services/feedbackTargets/updateFeedbackResponse.ts:37-44`

- `previousResponse.length` throws a TypeError when there was no previous response, and the request returns 500.
- The email is sent before `save()`, so students get the email even if saving fails.

### The counter feedback email shows raw Markdown

`src/server/mailer/mails/sendFeedbackSummaryReminderToStudents.ts:33-39`

The counter feedback supports Markdown on the web page, but the email inserts the raw text unescaped (`{{- feedbackResponse}}`) into an HTML body. Students see `**bold**` and `![](url)` as they were written.

Fix: render the Markdown to sanitised HTML first.

### The UI language chosen in the menu reverts on reload

`src/client/components/NavBar/NavBar.jsx:305-307`, `src/client/pages/AdUser.tsx:31-37`

The language menu only calls `i18n.changeLanguage`. On every page load `AdUser` applies the user's language from Sisu, which overrides the choice.

Fix: save the choice on the user, or apply the Sisu language only when the user hasn't chosen one.

### Feedback liaisons from IAM are never created

`../jami/src/auth/IAMConfig.ts:507`, `src/server/services/users/updateFeedbackCorrespondent.ts:32-41`

Jami grants the `feedbackLiaison` special group from the IAM group `hy-palautevastaavat`. No user has that group; 110 have `grp-palautevastaavat`, so the group seems to have been renamed. All feedback liaisons in Norppa are ones added by hand.

Fix: check the current group name with IAM and update Jami.

### Carry-over can copy questions from interim feedback

`src/server/models/feedbackTarget.ts:270-295` (`getPrevious`) picks the previous realisation's feedback target by course unit and feedback type only. Interim feedback has the same course unit and feedback type, so a new course survey can get its questions from an earlier interim feedback instead of the course survey.

Fix: exclude `userCreated` feedback targets.

### The MOOC chip never shows

`src/client/pages/Organisation/SemesterOverview.jsx:204` reads `feedbackTarget.isMoocCourse`, but the server returns it under `courseRealisation` (`getByOrganisation.ts:49`), so it's always undefined.

### Copying questions into interim feedback only offers organisation surveys

`src/client/components/QuestionEditor/CopyFromCourseDialog.jsx:130-199` treats every user-created survey as an organisation survey, but interim feedback is user-created too. Teachers who aren't organisation admins get nothing to copy from in interim feedback.

## Dead code and data

- `feedback_targets.feedback_visibility` has had no UI since commit 493aaab9, but the server still accepts and reads it (`update.ts:22`, `getFeedbacks.ts:148`). 47 surveys still have `ALL`.
- Token enrolment (`services/feedbackTargets/enrollByToken.ts`) isn't wired to any route.
- The "not giving feedback" button needs `course_units_organisations.no_feedback_allowed`, which nothing sets and which is never true in production.
- `feedbackTargetResults:useLegacyVersion`, `STUDENT_FEEDBACK_SHOW_REALISATION_NAME`, `FEEDBACK_RESPONSE_EMAILS_SINCE_DATE` and `organisations.responsible_user_id` aren't used.

## UI shows actions the server forbids

Each of these gives the user an error when they try the action.

| What                            | Shown to                         | Allowed for                      | Where                                                           |
| ------------------------------- | -------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| Send reminder email (Share tab) | all teachers                     | responsible teachers, org admins | `tabs/Share/Share.jsx:72-84`, `Access.ts:77`                    |
| Hide an open answer (eye icon)  | all teachers                     | responsible teachers, org admins | `useUpdateOpenFeedbackVisibility.js:39`, `hideFeedback.ts:58`   |
| Give counter feedback tab       | responsible teachers, org admins | responsible teachers             | `FeedbackTargetContent.jsx:116`, `updateFeedbackResponse.ts:24` |

The reverse also happens: organisation admins who don't teach the course can change the feedback period on the server, but the Edit button is only shown to teachers of the course (`Dates/Dates.jsx:39`).

### Surveys opening on 1 August 2026 got the old university questions

The university survey valid from 1 August 2026 (id 47905 in production) has `valid_from` 2026-08-01 00:00 UTC. Surveys open at 00:00 Helsinki time, which is 21:00 UTC the day before, so a survey opening on 1 August picked the previous version (`src/server/services/surveys/universitySurvey.ts:17-24`).

Fix: set `valid_from` to 2026-07-31 21:00 UTC. Check whether any surveys opening that day are affected before changing it.

## Texts

- **The "Open feedback now" dialog is wrong about the dates.** `editFeedbackTarget:openFeedbackImmediatelyDialogContent` says the feedback period can't be edited once feedback is open, in all languages. The closing date can still be changed, and the edit dialog's own warning (`warningAboutOpeningCourse`) says so.
- **The enrolment delay is given two ways.** `feedbackView:cannotSubmitText` says enrolments update every 24 hours, and `feedbackTargetView:noAccess` says 1-2 hours. Enrolments are synced hourly (`updater/src/util/updateEnrolmentsCron.js:11`).
- **A search field label is hard-coded in Finnish.** The course field in `CopyFromCourseDialog.jsx:138` says "Kurssi"; the key `editFeedbackTarget:copyFromCourseSearchLabel` exists but isn't used.
- **Swedish uses three terms for counter feedback:** "Svar på respons" (`feedbackResponse:responseLabel`), "Ge motrespons" (`feedbackTargetView:giveFeedbackResponseTab`) and "Redigera återkopplingsfeedback" (`editFeedbackResponseTab`). `feedbackTargetView:feedbackResponseTab` has no Swedish text at all.
- **A Swedish translation is missing.** `teacherView:disabledCourseWarning` has no Swedish text, so Swedish users see it in English.

## Configuration

- **A threshold is hard-coded.** `src/server/services/feedbackTargets/getStudents.ts:90` has 5 where it should use `FEEDBACK_HIDDEN_STUDENT_COUNT`. No effect at HY, where the value is 5, but other deployments can't configure it.
