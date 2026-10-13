# Collecting answers

A survey opens by itself on its opening date, and students of a course survey get an email about it. To get more answers, share the survey's link in your teaching and send a reminder while the survey is open. Interim feedback and programme surveys send students no email by themselves, so for them the link and the reminder are the only ways to reach students.

## Sharing the link and QR code {#share-link}

Every survey has a link students use to answer it. To share it:

1. Open the survey from [[navBar:myCourses]].
2. Open the [[feedbackTargetView:shareTab]] tab.
3. Next to [[feedbackTargetView:studentLinkTitle]], click [[common:copyToClipBoard]].

The tab also has the [[feedbackTargetView:studentLinkQRTitle]], which students can scan with their phones, e.g. from a slide at the last lecture. The easiest way to share it is to take a screenshot of it.

The link works before the survey opens too, so you can add it to e.g. Moodle in advance. Students who open it early see when the survey will be open. Only the survey's own students can answer: the students enrolled on the course in Sisu, or the respondents of a programme survey.

All the course's teachers and the programme's admins see the [[feedbackTargetView:shareTab]] tab. On the course page, [[feedbackTargetView:copyLink]] copies the same link. After the survey has closed, the tab also has the [[feedbackTargetView:studentResultsLinkTitle]], see [Counter feedback](/guide/counter-feedback).

## Sending a reminder email {#send-reminder}

While a survey is open, you can email its students who haven't answered yet. This works the same way in all survey types, and it's the easiest way to get more answers. To send one:

1. Open the survey's [[feedbackTargetView:shareTab]] tab.
2. Click [[feedbackTargetResults:sendReminder]].
3. Edit the message under [[feedbackTargetResults:writeAMessage]] if you like.
4. Click [[feedbackTargetResults:sendReminderButton]].

The email goes to every student of the survey who hasn't answered yet, and it always includes a link to the survey.

- The message is filled in for you in the course's teaching language. If you send it unchanged, each student gets Norppa's standard reminder in their own language. If you edit it, every student gets your text as you wrote it, so write it in all the languages your students need.
- A reminder can be sent once every 24 hours per survey, whoever sends it. After sending, the tab shows when the latest reminder was sent, and the button is disabled for 24 hours.
- The responsible teachers and administrative persons of the course, the programme's admins and the responsible persons of a programme survey can send reminders.

## Emails Norppa sends {#emails}

Norppa sends its automatic emails once a day, at 11:15 Finnish time.

Course surveys:

- About a week before the survey opens, its responsible teachers and administrative persons get a reminder with the survey's dates, a link for editing it and the questions it has so far, so they can still add their own.
- On the opening day, the students get an email with a link to the survey and its closing date. Students who enrol later get it on a later day while the survey is open. If a responsible teacher opens the survey with [[editFeedbackTarget:openImmediately]], the email is sent at once (see [Course surveys](/guide/course-surveys#change-dates)).
- The day after the survey closes, the responsible teachers and administrative persons get a reminder to write counter feedback, if the survey got answers and has no counter feedback yet.

Programme surveys: only the counter feedback reminder to the survey's responsible persons, the day after it closes. Students get no email when it opens.

Interim feedback: no automatic emails at all.

Besides these, Norppa sends the emails people send through it: your reminders, the [counter feedback](/guide/counter-feedback#send-email) if you choose to email it, and the [continuous feedback](/guide/continuous-and-interim-feedback#continuous-feedback) digests and replies.

## What students see {#student-view}

- Students see their surveys in Norppa under [[navBar:myFeedbacks]]. Open surveys they haven't answered are under [[userFeedbacks:waitingForFeedbackTab]], with [[userFeedbacks:giveFeedbackButton]].
- After answering, they see a summary of the answers given so far to the public questions. See [Who sees the answers](/guide/results#public-answers).
- While the survey is open, they can edit their answers or remove them in [[navBar:myFeedbacks]].
- Answering is anonymous. You can't see who answered what, so you can't reward individual students for answering. See [Who has answered](/guide/results#who-answered) for what you can see.

Teachers can't answer their own course's survey: they see it as a [[common:preview]].

## Courses with fewer than 5 students {#small-courses}

On a small course, a student's answers could be recognised even without a name. So if fewer than 5 students are enrolled, the survey works differently:

- When a student opens the survey, a warning tells them that their answers could be linked to them. They can cancel or continue.
- To submit, the student must tick the box [[feedbackView:allowSubmitCheckbox]]
- Only the course's responsible teachers and administrative persons see the answers. Students, other teachers and programme staff see a note that the results aren't shown.
- The reminder email a week before opening tells the responsible teachers that the course is small.

The limit counts the students enrolled in Norppa, not the answers. It applies to all survey types.
