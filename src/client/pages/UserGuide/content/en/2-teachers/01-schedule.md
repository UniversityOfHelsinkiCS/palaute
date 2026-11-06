---
description: When a course survey opens and closes, and how to change its dates.
---

# Survey schedule

Norppa creates the course survey automatically, and it also opens and closes automatically. The teacher doesn't have to do anything for it to open. Before it opens, the teacher can still add [their own questions](/guide/questions) and [change the dates](#change-dates).

## When the survey is open {#feedback-period}

By default, a course survey opens at 00:00 on the day after the course's last day and closes at 23:59 14 days later, so it's open for about two weeks. For example, if the course's last day is 12 December, the survey is open from 13 to 27 December.

Norppa shows both the course's dates (from Sisu), [[feedbackTargetView:coursePeriod]], and the survey's dates, [[feedbackTargetView:feedbackPeriod]].

- The course's dates in Sisu set the survey's schedule. If the course's dates in Sisu run past the lectures, e.g. to include the exam, the survey opens later accordingly.
- Changing the course's dates in Sisu also changes the survey's dates automatically.
- If the teacher changes the survey's dates manually in Norppa, changes in Sisu no longer affect them.

About a week before the survey opens, the responsible teachers and administrative persons get an email with the survey's dates, a link for editing it and the questions the teachers have added so far. The email also mentions if fewer than 5 students are enrolled; see [Courses with fewer than 5 students](/guide/anonymity#small-courses).

## Changing the dates {#change-dates}

As a responsible teacher or administrative person of the course, you can change a course survey's dates:

1. Go to [[navBar:myCourses]] and choose the course.
2. Next to [[feedbackTargetView:feedbackPeriod]], click [[common:edit]].
3. In the [[feedbackTargetSettings:editPeriodTitle]] window, choose the dates under [[editFeedbackTarget:opensAt]] and [[editFeedbackTarget:closesAt]].
4. Click [[common:save]].

[[video:change-dates]]

Depending on the survey's state (upcoming, open, closed), the responsible teacher can change the following:

- Before it opens, you can change the opening and closing dates. The opening date can't be in the past, and the survey must be open for at least a day, so the closing date must be at least the day after the opening date.
- While it's open, you can only change the closing date. You can extend the survey, e.g. past the grading, or set the closing date to today to close it at 23:59 tonight. There's no button to close it at once.
- After it has closed, the dates can't be changed. Only support can reopen a closed course survey; see [Support](/guide/help#support).

> **Note:** Interim feedback and programme surveys aren't tied to Sisu, and their dates are changed differently, in any state. See [Interim feedback](/guide/during-the-course#interim-feedback) and [Editing a programme survey](/guide/programme-surveys#edit).

## Opening the survey now {#open-now}

(Note: add your own questions first, as they can't be changed once the survey is open.)

1. Go to [[navBar:myCourses]] and choose the course.
2. Next to [[feedbackTargetView:feedbackPeriod]], click [[common:edit]].
3. In the window, click [[editFeedbackTarget:openImmediately]].
4. Confirm with [[editFeedbackTarget:openFeedbackImmediatelyDialogConfirm]].

The survey opens at once and the students get an email with the link right away.

If you instead set the opening date to today and save, Norppa also asks you to confirm, and the survey opens at once. The students then get their email at the daily mailing at 11:15, the next day if it has already passed.

## Which courses get a survey {#which-courses}

A course survey is created automatically for courses whose realisation type in Sisu is one of these:

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

For other types, such as exams, theses, essays, independent work and training, a course survey can be opened separately through support: [norppa@helsinki.fi](mailto:norppa@helsinki.fi).

There's also no survey if the realisation is a draft, cancelled or archived in Sisu, or if it isn't linked to a course unit.

- A realisation that belongs to several course units still has only one survey.
- A course survey can't be deleted, but a degree programme can [switch off feedback](/guide/settings#disable-feedback) for a course unit.
- For feedback on something other than a course, such as an exam or several courses together, a degree programme can create a [programme survey](/guide/programme-surveys).

## Updates from Sisu {#sisu-updates}

Norppa updates its data from Sisu every night:

- New courses and their surveys, teachers, roles and course dates. A change made in Sisu shows in Norppa the next morning.
- Groups defined in Sisu (study sub-groups) become groups within the one survey, not separate surveys. See [Groups](/guide/questions#groups).

Student enrolments are updated more often: a new enrolment usually shows in Norppa within a couple of hours. Only confirmed enrolments count. A student whose enrolment is cancelled is removed the next night, unless they've already been emailed the survey link or have answered.
