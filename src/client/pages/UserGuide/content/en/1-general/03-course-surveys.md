# Course surveys

Norppa creates a course survey for each course realisation automatically, with dates based on the course's dates in Sisu. You don't have to do anything for it to open: the responsible teachers can add [their own questions](/guide/questions) and [change the dates](/guide/survey-dates), but they don't have to.

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

A week before the survey opens, the responsible teachers get an email reminding them that they can still add their own questions. See [Emails from Norppa](/guide/emails).

Responsible teachers can change the dates in Norppa; see [Survey dates](/guide/survey-dates).

## University level questions {#university-questions}

The university sets these questions for all course surveys. They're the same for every course and can't be edited or removed. In the editor they're marked [[questionEditor:universityQuestion]]. Interim feedback and programme surveys don't have them, but you can [add copies of them](/guide/questions#copy-questions).

They're shown at the top of the [[feedbackTargetView:surveyQuestionsTab]] tab. Which set a survey gets depends on when it opens: a new set is used in surveys that open on 2 August 2026 or later.

The averages of the university level scale questions are what [Course summary](/guide/course-summary#figures) shows.

## Programme questions {#programme-questions}

A degree programme or a faculty can add its own questions to the course surveys of all its course units. In the editor they're marked [[questionEditor:programmeQuestion]], and the box at the top of the [[feedbackTargetView:surveyQuestionsTab]] tab tells how many there are and which organisation added them.

Teachers can't edit or remove programme questions. If one doesn't suit your course, contact the programme. Interim feedback and programme surveys don't have programme questions.

Programme staff add and edit these questions on the programme's page: see [Programme questions](/guide/programmes#programme-questions).

## The order students see {#question-order}

The editor lists the university level questions first, then the programme questions, then the teacher's own. Students see them in this order:

1. The grouping question, if the survey has one (see [Groups](/guide/questions#groups)).
2. The university level scale and choice questions.
3. The programme's scale and choice questions.
4. The teacher's own questions and text sections, in the order the teacher has set.
5. The programme's open questions.
6. The university level open question, so _Additional comments_ is always last.

To check the result, use [[editFeedbackTarget:showPreview]] (see [Languages and preview](/guide/questions#languages)).
