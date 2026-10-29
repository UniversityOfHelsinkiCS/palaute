# Settings

The [[organisationSettings:settingsTab]] tab of the programme's page (admins only) has the feedback liaisons, [[organisationSettings:generalSettings]] and [[organisationSettings:courseSettings]]. Every change is saved at once.

## Adding a feedback liaison {#feedback-liaison}

A feedback liaison gets admin rights to the programme in Norppa: they see all answers of its courses and can do everything the programme's admins can. The programme's admins add liaisons:

1. On the programme's page, open the [[organisationSettings:settingsTab]] tab.
2. Under [[organisationSettings:newCorrespondent]], type at least five characters of the person's email address or name.
3. Click [[organisationSettings:setAsCorrespondent]] next to the right person and confirm.

Only university staff can be found. If someone isn't found, ask them to log in to Norppa once and try again.

The [[organisationSettings:feedbackCorrespondents]] list shows the programme's liaisons. [[organisationSettings:remove]] removes one.

<!-- Explain IAM-based liaisons once Jami actually creates them; see documentation/known_bugs.md. -->

## Who sees the respondents {#student-list}

On a survey's [[feedbackTargetView:studentsWithFeedbackTab]] tab, the course's responsible teachers see the list of its students. Under [[organisationSettings:studentListVisibility]] you choose whether the list also shows _who has answered_:

- [[organisationSettings:studentListVisible]]: shown on all the programme's courses.
- [[organisationSettings:studentListHidden]]: shown on none of them.
- [[organisationSettings:studentListByCourse]]: a [[organisationSettings:courseStudentListVisible]] switch appears for each course unit under [[organisationSettings:courseSettings]]. Turn it on for the courses where it's shown.

The setting applies to the course units of which the programme is the primary organisation. On a course unit shared by several programmes, the primary programme's setting decides.

Even when it's allowed, it's shown only once the survey has closed and at least 5 students have answered; see [Who has answered](/guide/anonymity#who-answered).

## Switching feedback off for a course {#disable-feedback}

Under [[organisationSettings:courseSettings]], each course unit of the programme has a [[organisationSettings:feedbackEnabled]] switch. Find the course with [[organisationSettings:findByCourseUnit]] and turn the switch off, e.g. for a course whose feedback is collected some other way.

The switch applies to all realisations of the course unit. Its teachers then see [[teacherView:disabledCourseWarning]] in [[navBar:myCourses]] and [[feedbackTargetView:feedbackDisabled]] on the course page. Students can't open the survey, and Norppa sends no emails about it. Turn the switch back on to collect feedback again.
