# Results

A survey's answers are on its [[feedbackTargetView:feedbacksTab]] tab from the first answer on, so you can follow them while the survey is open. Results work the same way in course surveys, interim feedback and programme surveys.

## Viewing the answers {#view-answers}

1. Go to [[navBar:myCourses]] and choose the course. Surveys of ended courses are on the [[teacherView:endedSurveys]] tab.
2. Open the [[feedbackTargetView:feedbacksTab]] tab.

[[video:view-answers]]

The tab shows:

- How the number of answers has grown day by day, as a share of the survey's students. The opening and closing dates and the last reminder email are marked on the chart.
- Under [[questionResults:multipleChoiceQuestions]], how the answers to each scale and choice question are distributed. Scale questions also show their mean, in which [[feedbackView:dontKnowOption]] answers aren't counted. The workload question shows an arrow pointing to the side its answers lean to.
- Under [[questionResults:openQuestions]], the answers to the open questions, in alphabetical order.

New answers appear when you reload the page. [[feedbackTargetResults:tableView]] shows the charts as tables, and [[feedbackTargetResults:chartView]] switches back.

If the course has groups in Sisu, or the survey has a grouping question, you can look at one group's answers with [[groups:chooseGroup]] at the top of the tab. A single group's answers are shown only if every group has either no answers or at least 5, so that no one can be recognised from them. See [groups](/guide/questions#groups).

If fewer than 5 students are enrolled on the course, the results are shown only to its responsible teachers. See [small courses](/guide/collecting-answers#small-courses).

## Who sees which answers {#public-answers}

Each question is either [[common:public]] or [[common:notPublic]].

- Responsible teachers, administrative persons and degree programme staff with admin rights see the answers to all questions.
- Teachers, programme staff with read rights and students see only the answers to public questions. Students see them once they have answered themselves, or after the survey has closed.

See [roles](/guide/roles#course-roles) for who has which role.

By default:

- Scale and choice questions you add are public.
- Open questions are not public.
- Questions you copy from another survey, or that are carried over from the course's previous realisation, are not public.
- Questions the university or the degree programme has made public are always public, and you can't change them. These include the university level scale and choice questions.

To change whether a question is public (responsible teachers):

1. On the [[feedbackTargetView:feedbacksTab]] tab, click [[common:public]] or [[common:notPublic]] above the question.
2. Choose [[common:publicInfo]] or [[common:notPublicInfo]]. The change is saved at once.

[[video:answer-visibility]]

Before the survey opens, you can also set this for scale and choice questions when you [edit the questions](/guide/questions#edit-questions).

An open question can be made public only after the survey has closed, as its answers may contain personal data. Norppa asks you to confirm that you've checked the answers contain no personal data or other sensitive information.

## Hiding open answers {#hide-answers}

If an open answer contains personal data, such as a student number, or is otherwise inappropriate, a responsible teacher or programme admin can hide it:

1. On the [[feedbackTargetView:feedbacksTab]] tab, find the answer.
2. Click the eye icon next to it ([[feedbackTargetResults:setHidden]]).

[[video:hide-answers]]

The answer is hidden from everyone who sees only public answers. Responsible teachers and programme admins still see it, marked as hidden. Answers identical to it in the same question are hidden too. To show it again, click the icon again ([[feedbackTargetResults:setVisible]]).

Hiding matters only for questions that are public. Hidden answers are left out of the PDF download.

You can't delete answers. If an answer must be removed entirely, contact [support](/guide/support#support).

## Who has answered {#who-answered}

The [[feedbackTargetView:studentsWithFeedbackTab]] tab lists the survey's students with their names, student numbers and email addresses. Responsible teachers and programme admins see it.

Whether each student has answered ([[common:feedbackGiven]] or [[common:feedbackNotGiven]]) is shown only if all of these are true:

- the survey has closed,
- at least 5 students have answered, and
- the course's degree programme allows it in its settings, for all its courses or for this course. See [programme settings](/guide/programmes#settings).

Otherwise the column shows [[common:feedbackHidden]]. The list never shows who answered what.

[[feedbackTargetView:copyStudentNumbers]] copies the student numbers, e.g. to paste into an email. [[common:exportXLSX]] downloads the list.

## Downloading the answers {#download}

Responsible teachers and programme staff can download the answers with [[feedbackTargetResults:export]] at the top of the [[feedbackTargetView:feedbacksTab]] tab:

- [[common:exportXLSX]]: a spreadsheet with a column for each question. The answers are shuffled within each column, so a row isn't one student's answers. It has no timestamps or student information.
- [[common:exportPdf]]: opens your browser's print view of the tab as it's shown, as charts or tables. Choose to save it as a PDF there.

You get only the answers you can see on the tab. If you have chosen a group, you get only that group's answers.

For figures across courses, years and degree programmes, see [course summary](/guide/course-summary).

[[video:download-answers]]
