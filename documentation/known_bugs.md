# Known bugs

Found while writing the help chatbot's knowledge document (September 2026) and the in-app user guide (October 2026), and checked against the code. Paths starting with `updater/` are in the [norppa-updater](https://github.com/UniversityOfHelsinkiCS/norppa-updater) repository, the rest in this one. Remove an entry once it's fixed.

**This doc has been written up by an AI agent, not manually checked, so take it with a grain of salt. Use it as a list of likely bugs that should be checked, and either fixed or removed from the list.**

## Privacy and access

### Small courses' answers are protected only in the UI

`src/server/services/feedbackTargets/getFeedbacks.ts:160-178`

On courses with fewer than five students, only the Results tab limits the answers to responsible teachers (`Results.jsx:172`). The server returns them to anyone with normal access (teachers, programme staff with read rights and students get the public ones) as soon as any student's user feedback target was updated after 10 June 2025, which is taken as consent. But `updatedAt` also changes for unrelated writes, e.g. when `feedbackOpenEmailSent` is set (`sendEmailToStudentsWhenOpeningImmediately.ts:61`), so it doesn't show consent.

Fix: store the consent with the answer, and check the role on the server.

### Continuous feedback can be linked to students

`src/server/routes/continuousFeedback/continuousFeedbackController.ts:48-54`

Teachers and programme admins get the whole `ContinuousFeedback` rows, including `userId`. The UI shows no names, but the ids link one student's feedback together, and the student list (shown always at HY) returns user ids too.

Fix: leave `userId` out of the response.

### A teacher can reply to any course's continuous feedback

`src/server/routes/continuousFeedback/continuousFeedbackController.ts:88-115`

`respondToFeedback` checks the user's rights to `:id`, then loads the feedback by `continuousFeedbackId` alone. A responsible teacher of any course can reply to any continuous feedback, and the reply is emailed to that student.

Fix: check that the feedback's `feedbackTargetId` is `:id`.

### Read rights get every open answer of an organisation

`src/server/routes/organisations/organisationController.ts:205-220`, `src/server/services/organisations/getOpenFeedbackByOrganisation.ts`

The Open questions tab is for admins only in the UI, but the endpoint accepts any organisation access. It returns all answers to the university and programme open questions, whether public or hidden.

Fix: require admin access, as the UI does.

### Readers see the hidden answer count in the course summary

`src/server/services/summary/getTeacherSummary.ts:14-41`

`hiddenCount` is removed only from the My courses data, for organisations where the user isn't an admin. The My organisations view, the programme's Summary tab and the course unit page return it to everyone with read access.

Fix: filter it in all summary endpoints.

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

### Survey dates can be changed after the survey has opened or closed

`src/server/services/feedbackTargets/update.ts:154-158`

Only the client limits the dates (`Dates/utils.js:27-40`, `FeedbackPeriodForm.jsx:30-38`). The server checks only that the closing date isn't before the opening date, so an open survey's opening date can be moved and a closed survey reopened.

Fix: for non-admins, reject `opensAt` once the survey has opened and both dates once it has closed.

### Organisation surveys with answers can be deleted

`src/server/routes/organisations/organisationSurveyController.ts:165-185`

The handler already throws when the user isn't an organisation admin, so the later check `!hasAdminAccess && !allowDelete` is always false. Deleting a survey that has answers is never blocked on the server; only the UI hides the Remove button.

Fix: `if (!allowDelete && !user.isAdmin) throw Forbidden`.

### Interim feedback with answers can be deleted

`src/server/services/feedbackTargets/interimFeedbacks.ts:214-245`

The UI hides the Remove button once interim feedback has answers (`InterimFeedbackItem.jsx`), but the server only checks the user's rights, then deletes the user feedback targets and the survey.

Fix: refuse when the interim feedback has answers, unless the user is an admin.

### Counter feedback has no time limit on the server

`src/server/services/feedbackTargets/updateFeedbackResponse.ts:24-40`

The counter feedback tab is hidden 12 months after the survey closes, but the server checks neither the age nor whether the survey has closed. The client's check `differenceInMonths(now, closesAt) > 12` (`util/feedbackTargetIsOld.ts`) also keeps the tab until 13 full months have passed.

Fix: check both on the server, and use `>= 12` in the client.

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

### "Open feedback now" emails the teachers too

`src/server/mailer/mails/sendEmailToStudentsWhenOpeningImmediately.ts:35-53`

The query includes all users of the survey, and nothing filters out the teachers, so they get the students' opening email. The daily opening email filters on `accessStatus: 'STUDENT'` (`sendEmailAboutSurveyOpeningToStudents.ts:49`). The query also fetches `disabledCourseCodes` but never uses it, so the email goes out for courses where feedback is switched off.

Fix: filter on `accessStatus: 'STUDENT'` and skip disabled course codes, as the daily email does.

### Saving a programme survey again removes students who have answered

`src/server/services/organisations/organisationSurveys.ts:524-532`

Saving recalculates the students from the chosen courses and the student numbers, and `removeUserFeedbackTargets` deletes the user feedback targets of everyone else. Students who have left a chosen course lose theirs even if they have answered, and the answer drops out of the results, which are read through the user feedback targets. The same happens to a student who has answered and is then made a responsible teacher.

Fix: keep the user feedback targets that have feedback. A kept student row also blocks the same user's teacher row, because a user can have only one user feedback target per feedback target.

### Saving a programme survey isn't atomic

`src/server/services/organisations/organisationSurveys.ts:560-622`

`updateOrganisationSurvey` updates the feedback target, the course realisation, the chosen courses and the user feedback targets in separate queries without a transaction. If one fails, the survey is left half-saved, e.g. with the old teachers removed and the new ones not added.

Fix: run the writes in one transaction. `createUserFeedbackTargets` catches and logs insert errors, which doesn't work inside a transaction: in PostgreSQL a failed insert aborts the transaction, and the commit then silently rolls back. Skip the users who already have a user feedback target before inserting, and let other errors through.

### Deleting a programme survey isn't atomic either

`src/server/services/organisations/organisationSurveys.ts:624-702`

`deleteOrganisationSurvey` opens a transaction but doesn't pass it to any of its queries, so each delete is committed on its own and the rollback undoes nothing. If one fails, the survey is left half-deleted, e.g. without its user feedback targets and questions but still listed.

Fix: pass `{ transaction: t }` to every query.

### The grouping question is carried over with the old groups

`src/server/services/surveys/teacherSurvey.ts:10-27`

Carry-over clones the previous realisation's own questions with their `data`, and a grouping question's options are the previous realisation's Sisu groups (`GroupingQuestionSettings.jsx:117-128`). The new survey asks students to choose between last time's groups, and the results page finds no teachers for them (`Results.jsx:66-75`).

Fix: rebuild the options from the new realisation's groups, or leave the grouping question out of the carry-over.

### Interim feedback that starts today can't get any questions

`src/client/pages/FeedbackTarget/tabs/InterimFeedback/utils.js:44`, `InterimFeedback.jsx:58`

The start date can be today or in the past. The interim feedback then opens as soon as it's saved, and Norppa takes the teacher to its Questions tab, which is disabled once a survey is open (`FeedbackTargetContent.jsx:175`). The survey is open to students with no questions, and the only way out is to move the start date forward, add the questions and move it back.

Fix: don't allow a start date before tomorrow, or warn that the survey opens at once.

### The spreadsheet download includes hidden answers

`src/client/pages/FeedbackTarget/tabs/Results/ExportFeedbacksMenu.jsx:56-81`

Hidden answers are left out of the PDF (`OpenFeedback.jsx:23-26`), but the XLSX doesn't filter them, so responsible teachers and programme admins get them in the spreadsheet. Answers are usually hidden because they contain personal data.

Fix: leave out answers marked `hidden`.

### The live summary update gets the mean wrong

`src/server/services/summary/utils.ts:181-250`

After each answer, `addFeedbackDataToSummary` updates the realisation's summary. It counts "N/A" (option 0) as the value 0, which the nightly rebuild leaves out (`utils.ts:29`), and it divides by the survey's answer count instead of the question's, so skipped optional questions lower the mean too. `removeFeedbackDataFromSummary` divides by zero when the last answer is deleted. The nightly rebuild corrects the figures.

Fix: keep a count per question and leave option 0 out.

### The answer chart shows the latest reminder a day early

`src/client/pages/FeedbackTarget/tabs/Results/QuestionResults/FeedbackChart.jsx:107-110`

The marker is drawn at `subDays(feedbackReminderLastSentAt, 1)`. The closing date marker had the same offset when the chart was made (commit 70d825b0), and it has since been removed.

Fix: drop the `subDays`.

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

| What                                 | Shown to                         | Allowed for                      | Where                                                           |
| ------------------------------------ | -------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| Send reminder email (Share tab)      | all teachers                     | responsible teachers, org admins | `tabs/Share/Share.jsx:72-84`, `Access.ts:77`                    |
| Hide an open answer (eye icon)       | all teachers                     | responsible teachers, org admins | `useUpdateOpenFeedbackVisibility.js:39`, `hideFeedback.ts:58`   |
| Give counter feedback tab            | responsible teachers, org admins | responsible teachers             | `FeedbackTargetContent.jsx:116`, `updateFeedbackResponse.ts:24` |
| Create interim feedback              | responsible teachers, org admins | responsible teachers             | `FeedbackTargetContent.jsx:121-122`, `interimFeedbacks.ts:169`  |
| Edit interim feedback name and dates | all teachers                     | responsible teachers             | `FeedbackTargetInformation.jsx:34`, `interimFeedbacks.ts:199`   |

The reverse also happens: organisation admins who don't teach the course can change the feedback period on the server, but the Edit button is only shown to teachers of the course (`Dates/Dates.jsx:39`).

## Texts

- **The "Open feedback now" dialog is wrong about the dates.** `editFeedbackTarget:openFeedbackImmediatelyDialogContent` says the feedback period can't be edited once feedback is open, in all languages. The closing date can still be changed, and the edit dialog's own warning (`warningAboutOpeningCourse`) says so.
- **The enrolment delay is given two ways.** `feedbackView:cannotSubmitText` says enrolments update every 24 hours, and `feedbackTargetView:noAccess` says 1-2 hours. Enrolments are synced hourly (`updater/src/util/updateEnrolmentsCron.js:11`).
- **A search field label is hard-coded in Finnish.** The course field in `CopyFromCourseDialog.jsx:138` says "Kurssi"; the key `editFeedbackTarget:copyFromCourseSearchLabel` exists but isn't used.
- **Swedish uses three terms for counter feedback:** "Svar på respons" (`feedbackResponse:responseLabel`), "Ge motrespons" (`feedbackTargetView:giveFeedbackResponseTab`) and "Redigera återkopplingsfeedback" (`editFeedbackResponseTab`). `feedbackTargetView:feedbackResponseTab` has no Swedish text at all.
- **A Swedish translation is missing.** `teacherView:disabledCourseWarning` has no Swedish text, so Swedish users see it in English.
- **Counter feedback emails for interim feedback and programme surveys get the translation key as their subject in English and Swedish.** For user-created surveys, `sendFeedbackSummaryReminderToStudents.ts:29` uses `mails:counterFeedbackNotificationToStudents:customSubject`, which exists only in Finnish; the fallback is English, which doesn't have it either. Swedish also lacks `customText` there and both custom texts of `mails:counterFeedbackReminder`, so Swedish users get those in English.

## Configuration

- **A threshold is hard-coded.** `src/server/services/feedbackTargets/getStudents.ts:90` has 5 where it should use `FEEDBACK_HIDDEN_STUDENT_COUNT`. No effect at HY, where the value is 5, but other deployments can't configure it.
