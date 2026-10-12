# Programme surveys

A programme survey is a survey a degree programme or faculty makes itself for students it chooses, e.g. semester feedback, feedback on a study track or feedback across several courses. It has no university level or programme questions: you write all its questions.

Programme surveys are created by the programme's admins. Otherwise they work like course surveys: they open and close by their dates, and the questions, sharing, answers and counter feedback work the same way.

## Creating a programme survey {#create}

1. On the [programme's page](/guide/programmes#programme-page), open the [[organisationSettings:organisationSurveysTab]] tab (on a faculty's page [[organisationSettings:organisationFacultySurveysTab]]).
2. Click [[organisationSurveys:addSurvey]].
3. Give the survey a name under [[organisationSurveys:newSurveyName]], in at least one language.
4. Choose the dates under [[organisationSurveys:startDate]] and [[organisationSurveys:endDate]]. The survey opens at 00:00 on the first day and closes at 23:59 on the last. It can be open as long as you like, e.g. a whole semester.
5. Add the [[organisationSurveys:responsibleTeachers]] (see [Responsible persons](#responsible-persons)). You're one of them already.
6. Add the respondents (see [Respondents](#respondents)).
7. Click [[common:save]]. Norppa opens the new survey's [[feedbackTargetView:surveyQuestionsTab]] tab.
8. Add the questions as in any survey; see [Editing the questions](/guide/questions#edit-questions). [[editFeedbackTarget:copyFromCourseButton]] copies questions from other programme surveys, and [[editFeedbackTarget:copyUniversityQuestions]] adds the university level questions if you want them.

That's all: the survey opens by itself on its opening date. Until then, you can still change its questions.

> **Note:** Students get no email when a programme survey opens. Once it's open, send them a [reminder](#reminders) or share its link from the [[feedbackTargetView:shareTab]] tab.

## Respondents {#respondents}

Only the students added to the survey can answer it. They see it in [[navBar:myFeedbacks]] while it's open. You can add them in two ways, and combine them:

- _Student numbers_: paste or type them in the [[organisationSurveys:studentNumberInputLabel]] field, separated by commas, semicolons, spaces or line breaks (e.g. a column copied from Excel). A missing leading zero is added. When you save, Norppa marks the numbers it doesn't recognise in red and doesn't save until you fix or remove them.
- _Students of courses_: under [[organisationSurveys:addCourses]], choose the period next to the field, search for the programme's course realisations by name or code and choose them. Each one shows its number of students.

The courses' students are copied to the survey when you save; the list doesn't follow later changes in enrolments. To add students who enrolled later, open [[organisationSurveys:editSurvey]] and save again: the chosen courses' current students are copied in then.

A student added more than once is counted once. A responsible person can't be a respondent of the same survey.

## Responsible persons {#responsible-persons}

The [[organisationSurveys:responsibleTeachers]] have the rights of a responsible teacher on this survey only: they can edit its questions before it opens, change its settings, see all its answers and the [[feedbackTargetView:studentsWithFeedbackTab]] tab, send reminders and write counter feedback. On the survey's page they're listed under [[feedbackTargetView:administrativePersons]]. They find the survey in [[navBar:myCourses]] under [[teacherView:organisationSurveys]].

To add one, type at least five characters of their name or email address in the field and choose them. Only university staff can be found; if someone isn't found, ask them to log in to Norppa once. There must always be at least one.

The programme's admins can also edit the survey and see its answers without being responsible persons. Only the responsible persons can write its [counter feedback](/guide/counter-feedback), though, so add yourself if you'll write it.

## Editing a programme survey {#edit}

Open the survey: in [[navBar:myCourses]] under [[teacherView:organisationSurveys]], or from the programme's [[organisationSettings:organisationSurveysTab]] tab with [[organisationSurveys:viewFeedback]].

- _Name, dates, responsible persons and respondents_: click [[organisationSurveys:editSurvey]] on the survey's page, make the changes and click [[common:save]]. This works before, during and after the feedback period.
- _Questions_: the [[feedbackTargetView:surveyQuestionsTab]] tab, until the survey opens. After that, the questions are locked.

To open the survey right away, set its start date to today: it opens at once, but students get no email. To reopen a closed survey, move its end date forward.

### Sending a reminder {#reminders}

Norppa sends students no email about a programme survey by itself. While the survey is open, a responsible person or the programme's admin can email the students who haven't answered yet:

1. Open the survey's [[feedbackTargetView:shareTab]] tab.
2. Click [[feedbackTargetResults:sendReminder]].
3. Write a message under [[feedbackTargetResults:writeAMessage]] if you like, and click [[feedbackTargetResults:sendReminderButton]].

The email includes the survey's link. It can be sent once every 24 hours. See [Sending a reminder](/guide/collecting-answers#send-reminder).

## Results {#results}

The answers are on the survey's [[feedbackTargetView:feedbacksTab]] tab as they come in; from the programme's [[organisationSettings:organisationSurveysTab]] tab, click [[organisationSurveys:viewResults]]. They work as in course surveys; see [Results](/guide/results). On the programme surveys tab, each survey's card shows [[organisationSurveys:givenFeedback]] as answers / respondents.

After the survey closes, the responsible persons can write counter feedback to the students. If the survey got answers but has no counter feedback, they get a reminder email the day after it closes, and [[navBar:myCourses]] shows [[teacherView:feedbackResponseMissing]]. See [Counter feedback](/guide/counter-feedback).

Programme surveys aren't included in the [course summary](/guide/course-summary).

### Removing a programme survey {#remove}

A programme survey can be removed while nobody has answered it: on the programme's [[organisationSettings:organisationSurveysTab]] tab, click [[organisationSurveys:remove]] on the survey's card and confirm. Once it has answers, the button is gone; change its dates instead if it shouldn't be answered.
