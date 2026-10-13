# Course surveys

Norppa creates a course survey for each course realisation automatically, with dates based on the course's dates in Sisu. You don't have to do anything for it to open: the responsible teachers can add their own questions and change the dates, but they don't have to.

## Which courses get a survey {#which-courses}

A course survey is created for course realisations of these types in Sisu:

- lab work
- online teaching
- field course
- project
- lectures
- small group teaching
- seminar
- blended teaching
- contact teaching
- distance teaching
- and, for the Language Centre only, independent work projects

<!-- Sisu codes: urn:code:course-unit-realisation-type:teaching-participation-lab, -online, -field-course, -project, -lectures, -small-group, -seminar, -blended, -contact, -distance; independent-work-project for the Language Centre (hy-org-1000003401). Source: validRealisationTypes in norppa-updater, updateCoursesAndTeacherFeedbackTargets.js. -->

Other types, such as exams, theses, essays, independent work and training, get no survey, whatever their credits. On request, support can enable a survey for an independent work project, essay, training or master's thesis realisation, but not for an exam.

There's also no survey if the realisation is cancelled, archived or still a draft in Sisu, or if it isn't linked to a course unit.

- A realisation that belongs to several course units still has only one survey.
- A course survey can't be deleted, but a degree programme can [switch off feedback](/guide/programmes#disable-feedback) for a course unit.
- For feedback on something without a course survey, such as an exam or several courses together, a degree programme can create a [programme survey](/guide/programme-surveys).

## Updates from Sisu {#sisu-updates}

Norppa updates its data from Sisu every night:

- New courses and their surveys, teachers, roles and course dates. A change made in Sisu shows in Norppa the next morning.
- Groups defined in Sisu (study sub-groups) become groups within the one survey, not separate surveys. See [Groups](/guide/questions#groups).

Student enrolments are updated more often: a new enrolment usually shows in Norppa within a couple of hours. Only confirmed enrolments count. A student whose enrolment is cancelled is removed the next night, unless they've already been emailed the survey link or have answered.

## The default feedback period {#feedback-period}

By default, a course survey opens at 00:00 on the day after the course's last day and closes at 23:59 14 days later, so it's open for about two weeks. For example, if the course's last day is 12 December, the survey is open from 13 to 27 December.

The course's page shows both periods: [[feedbackTargetView:coursePeriod]] is the course's dates from Sisu and [[feedbackTargetView:feedbackPeriod]] is the survey's dates.

- Only the course's dates in Sisu count, not its teaching events. If the course's dates in Sisu run past the teaching, e.g. to include the exam, the survey opens later accordingly.
- Until someone saves dates for the survey in Norppa, its dates follow the course's dates in Sisu every night. So changing the course's dates in Sisu also moves the survey.
- Once dates have been saved in Norppa, Sisu no longer changes them.

A week before the survey opens, the responsible teachers get an email reminding them that they can still add their own questions. See [Emails Norppa sends](/guide/collecting-answers#emails).

## Changing the dates {#change-dates}

Responsible teachers and administrative persons can change a course survey's dates:

1. Go to [[navBar:myCourses]] and choose the course.
2. Next to [[feedbackTargetView:feedbackPeriod]], click [[common:edit]].
3. In the [[feedbackTargetSettings:editPeriodTitle]] window, choose the dates under [[editFeedbackTarget:opensAt]] and [[editFeedbackTarget:closesAt]].
4. Click [[common:save]].

What you can change depends on the survey's state:

- Before it opens, you can change both dates. The opening date can't be in the past, and the survey must be open for at least a day, so the closing date must be at least the day after the opening date.
- While it's open, you can only change the closing date. You can extend the survey, e.g. past the grading, or set the closing date to today to close it at 23:59 tonight. There's no button to close it at once.
- After it has closed, the dates can't be changed. Only support can reopen a closed course survey.

To open the survey now, click [[editFeedbackTarget:openImmediately]] in the same window and confirm with [[editFeedbackTarget:openFeedbackImmediatelyDialogConfirm]]. The survey opens at once and the students get an email with the link right away. Add your own questions first: once the survey is open, they can't be changed.

If you instead set the opening date to today and save, Norppa also asks you to confirm, and the survey opens at once. The students then get their email at the daily mailing at 11:15, the next day if it has already passed.

> **Note:** Interim feedback and programme surveys don't follow Sisu, and their dates are changed differently, in any state. See [Interim feedback](/guide/continuous-and-interim-feedback#interim-feedback) and [Editing a programme survey](/guide/programme-surveys#edit).
