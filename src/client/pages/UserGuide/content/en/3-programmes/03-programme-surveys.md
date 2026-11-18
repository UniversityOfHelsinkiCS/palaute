---
description: The programme's or faculty's own surveys, such as semester feedback: creating one, its respondents and its responsible persons.
---

# Programme surveys

A programme survey is an "organisation level" survey. A degree programme or faculty can make one at its own level, built from scratch for students it chooses. For example: semester feedback, feedback on a study track or feedback across several courses. Such a survey has no university level or programme questions by default, but you can add them if you want.

Programme surveys can be created by the programme's admins (programme director or feedback liaison). Technically they work like course surveys: opening dates, questions, sharing, answers and counter feedback. The survey's [responsible persons](#responsible-persons) have equivalent rights to a responsible teacher, so the detailed instructions are the same as in _For responsible teachers_: [Questions](/guide/questions), [Collecting answers](/guide/collecting-answers), [Results](/guide/results) and [Counter feedback](/guide/counter-feedback).

## Creating a programme survey {#create}

1. On the [programme's page](/guide/programme-page#programme-page), open the [[organisationSettings:organisationSurveysTab]] tab (on a faculty's page [[organisationSettings:organisationFacultySurveysTab]]).
2. Click [[organisationSurveys:addSurvey]].
3. Give the survey a name under [[organisationSurveys:newSurveyName]], in at least one language.
4. Choose the dates under [[organisationSurveys:startDate]] and [[organisationSurveys:endDate]]. The survey opens at 00:00 and closes at 23:59 on the last day. It can be open as long as needed, e.g. a whole semester.
5. Add the [[organisationSurveys:responsibleTeachers]] (see [Responsible persons](#responsible-persons)). (The survey's creator automatically has administrative person rights.)
6. Add the respondents (see [Respondents](#respondents)).
7. Click [[common:save]]. Norppa opens the new survey's [[feedbackTargetView:surveyQuestionsTab]] tab.
8. Add the questions as in any survey; see [Editing the questions](/guide/questions#edit-questions). [[editFeedbackTarget:copyFromCourseButton]] copies questions from other programme surveys, and [[editFeedbackTarget:copyUniversityQuestions]] adds the university level questions if you want them.

[[video:programme-survey]]

All done: the survey opens by itself on its opening date (you can still edit the questions before it opens, if you like).

> **Note:** Students get no email when a programme survey opens. Once it's open, send them a [reminder](#reminders) or share its link from the [[feedbackTargetView:shareTab]] tab.

## Respondents {#respondents}

Only the students added to the survey can answer it. They see it in [[navBar:myFeedbacks]] while it's open. You can add them in two ways, and combine them:

- _Student numbers_: paste or type them in the [[organisationSurveys:students]] field, separated by commas, semicolons, spaces or line breaks (e.g. a column copied from Excel). When you save, Norppa marks the numbers it doesn't recognise in red and doesn't save until you fix or remove them.
- _Students of courses_: under [[organisationSurveys:addCourses]], choose the period next to the field, search for the programme's course realisations by name or code and choose them (each one shows its number of students).

The courses' students are copied to the survey when you save; the list doesn't follow later changes in enrolments. To add students who enrolled later, open [[organisationSurveys:editSurvey]] and save again: the chosen courses' current students are added.

## Responsible persons {#responsible-persons}

The [[organisationSurveys:responsibleTeachers]] have the rights of a responsible teacher on this survey only: they can edit its questions before it opens, change its settings, see all its answers and the [[feedbackTargetView:studentsWithFeedbackTab]] tab, send reminders and write counter feedback. On the survey's page they're listed under [[feedbackTargetView:administrativePersons]]. They find the survey in [[navBar:myCourses]] under [[teacherView:organisationSurveys]].

To add one, type at least five characters of their name or email address in the field and choose them. Only university staff can be found; if someone isn't found, ask them to log in to Norppa once. There must always be at least one.

The programme's admins (programme director and feedback liaison) can also edit the survey and see its answers without being responsible persons. Only the responsible persons can write its [counter feedback](/guide/counter-feedback), though.

## Editing a programme survey {#edit}

Open the survey: in [[navBar:myCourses]] under [[teacherView:organisationSurveys]], or from the programme's [[organisationSettings:organisationSurveysTab]] tab with [[organisationSurveys:viewFeedback]].

- _Name, dates, responsible persons and respondents_: click [[organisationSurveys:editSurvey]] on the survey's page, make the changes and click [[common:save]]. This works before, during and after the feedback period.
- _Questions_: the [[feedbackTargetView:surveyQuestionsTab]] tab below the [[feedbackTargetView:surveyTab]] tab, until the survey opens. After that, the questions are locked.

To open the survey right away, set its start date to today: it opens at once (students get no automatic email about it opening). To reopen a closed survey, move its end date forward.

### Sending a reminder {#reminders}

Norppa sends students no email about an organisation level survey by itself. While it's open, a responsible person or the programme's admin can [send a reminder](/guide/collecting-answers#send-reminder) from its [[feedbackTargetView:shareTab]] tab to the students who haven't answered yet.

## Results {#results}

The answers collect on the survey's [[feedbackTargetView:feedbacksTab]] tab and can be viewed from its opening date. Path: the programme's [[organisationSettings:organisationSurveysTab]] tab -> (choose the survey and) -> [[organisationSurveys:viewResults]]. The answers section works technically as in course surveys; see [Results](/guide/results).

After the survey closes, the responsible persons can write counter feedback to the students. If the survey got answers but has no counter feedback, the responsible persons get a reminder email the day after it closes, and [[navBar:myCourses]] shows [[teacherView:feedbackResponseMissing]]. See [Counter feedback](/guide/counter-feedback).

Programme surveys aren't included in the [course summary](/guide/course-summary).

### Removing a programme survey {#remove}

A programme survey can be removed while nobody has answered it: on the programme's [[organisationSettings:organisationSurveysTab]] tab, click [[organisationSurveys:remove]] on the survey's card and confirm. Once it has answers, the button is gone; if you want to make it "unanswerable", change its dates.
