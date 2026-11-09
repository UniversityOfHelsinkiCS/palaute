---
description: Adding your own questions before the survey opens, the question types and the fixed questions.
---

# Questions

A course survey always has the university level questions and possibly questions from the degree programme, which you can't change; see [Fixed questions](#fixed-questions). In addition, you can add your own questions until the survey opens. Interim feedback and programme surveys have only their own questions.

## Editing the questions {#edit-questions}

You can edit the questions until the course feedback survey opens. After that the [[feedbackTargetView:surveyQuestionsTab]] tab is greyed out and the questions can no longer be edited. Once the survey has closed, the tab is gone.

To add a question:

1. Open the survey from [[navBar:myCourses]].
2. Open the [[feedbackTargetView:surveyQuestionsTab]] tab.
3. Below the questions, click [[questionEditor:addQuestion]] and choose the [type of question](#question-types).
4. Write the question in the Finnish, Swedish and English fields. You can also add a [[questionEditor:description]], e.g. to explain the question.
5. If students must answer the question, switch on [[common:required]].
6. Click [[questionEditor:done]].

[[video:edit-questions]]

If you add only one language version, everyone answering gets the survey in that language, whatever language they use Norppa in.

To change a question, click its [[common:edit]] button. To remove several questions at once, use [[questionEditor:removeMany]] below the questions.

[[questionEditor:addTextualContent]] adds a _text section_ instead of a question, e.g. instructions or a heading for the questions after it. Text sections and question descriptions support Markdown, e.g. links and lists.

The editing dialog of a scale or choice question also lets you choose whether its answers are public. Scale and choice questions you add are public by default, and open questions aren't; see [Answer visibility for different users](/guide/anonymity#public-answers).

Who can edit the questions:

- Course unit (course) survey: the course's responsible teachers and administrative persons, and the admins of the course's degree programme. See [Roles and rights](/guide/roles#course-roles).
- Interim feedback: the course's responsible teachers and the programme's admins.
- Programme survey: the survey's responsible persons and the programme's admins.

## Question types {#question-types}

There are four question types: [[questionEditor:likertQuestion]], [[questionEditor:openQuestion]], [[questionEditor:singleChoiceQuestion]] and [[questionEditor:multipleChoiceQuestion]]. Scale of values questions are answered from 1 to 5, or _N/A_. The numbers have no labels, so say in the question or its description what 1 and 5 mean, e.g. 1 = completely disagree, 5 = completely agree.

## Copying questions from another survey {#copy-questions}

To copy your own questions from another course survey into a course survey:

1. On the [[feedbackTargetView:surveyQuestionsTab]] tab, click [[editFeedbackTarget:copyFromCourseButton]].
2. You see the courses you teach. Choose the course you want.
3. The course's realisations that you've taught and that have their own questions are listed with their question counts. Hover over a realisation to see its questions.
4. Click [[editFeedbackTarget:copyQuestionsButton]] next to the realisation.

[[video:copy-questions]]

The questions are added after your existing questions and saved at once. Only the teacher's own questions are copied, not the university level or programme questions. Copied questions aren't public until you make them public.

In interim feedback and programme surveys, [[editFeedbackTarget:copyFromCourseButton]] lists programme surveys instead: those of the degree programmes and faculties where you have admin rights. There's also [[editFeedbackTarget:copyUniversityQuestions]], which you can use to add the university level questions if you want.

## Questions from the previous realisation {#carry-over}

When a new course realisation's survey is created in Norppa, Norppa copies the teacher's own questions from the previous realisation of the same course unit. If you don't want the copied questions in the new survey, you can remove them as usual.

- The copied questions aren't public until you make them public.
- A grouping question is copied too. Check that its options match this realisation's groups.
- In certain special cases, the questions can't be copied automatically, but you can copy them yourself if needed.

[Copying questions](#copy-questions).

## Languages and preview {#languages}

Students see the course survey in the language they use Norppa in: Finnish, Swedish or English. That's why the editor has a field for each language side by side. Fill in at least the languages your students use. If a language version is left empty, students see the survey in another language.

The survey as students see it:

1. At the bottom of the [[feedbackTargetView:surveyQuestionsTab]] tab, choose the language in [[editFeedbackTarget:translationLanguage]]. The questions in the editor switch to that language.
2. Click [[editFeedbackTarget:showPreview]].

[[video:preview-survey]]

The [[common:preview]] tab shows the whole survey as students see it.

## Groups {#groups}

If a course has study groups in Sisu, e.g. exercise groups, Norppa gets them from Sisu automatically. In a course survey with two or more Sisu groups, the answers can be viewed by group on the [[feedbackTargetView:feedbacksTab]] tab. The groups, their numbers of students and their teachers are listed under [[groups:groupingInfo]] at the top of the [[feedbackTargetView:surveyQuestionsTab]] tab.

If the course has no groups in Sisu, or they don't suit you, add a _grouping question_, in any type of survey:

1. On the [[feedbackTargetView:surveyQuestionsTab]] tab, click [[groups:addGroupingQuestion]].
2. Edit the question and its options. If the course has groups in Sisu, they're the default options.
3. Click [[questionEditor:done]].

[[video:grouping-question]]

The grouping question is required for respondents, it's the survey's first question, and its answers aren't public. A course survey can have only one, and if the teacher has created it, its grouping replaces the Sisu groups. To go back to the Sisu groups, remove the grouping question.

To protect anonymity, answers are shown by group only if every group with answers has at least 5 respondents (see [Answers by group](/guide/anonymity#groups)).

## Fixed questions {#fixed-questions}

### University level questions {#university-questions}

The university sets these questions for all course surveys. They're the same for every course and can't be edited or removed. In the editor they're marked [[questionEditor:universityQuestion]], and they're shown at the top of the [[feedbackTargetView:surveyQuestionsTab]] tab.

There are two versions of the questions: those used in 2021-2026, and those in use from autumn 2026. See [University level questions](/guide/university-questions). Interim feedback and programme surveys don't have the university-wide questions, but you can [copy them in](#copy-questions) if you want.

### Programme questions {#programme-questions}

A degree programme or a faculty can add its own questions, and they're automatically included in the course surveys of all the programme's course units. In the editor they're marked [[questionEditor:programmeQuestion]], and the [[feedbackTargetView:surveyQuestionsTab]] tab shows how many there are and which organisation added them.

Teachers can't edit or remove programme questions. Interim feedback and programme surveys don't have programme questions. Programme staff (the programme director and feedback liaisons) can add and edit these questions on the programme's page; see [Programme questions](/guide/programme-questions).

## The order students see {#question-order}

The editor lists the university level questions first, then the programme questions, then the teacher's own. Students see them in this order:

1. The grouping question, if the survey has one (see [Groups](#groups)).
2. The university level scale and choice questions.
3. The programme's scale and choice questions.
4. The course's (teacher's) own questions and text sections, in the order they've been set.
5. The programme's open questions.
6. The university level open question, so _Additional comments_ is always last.

To check the result, use [[editFeedbackTarget:showPreview]] (see [Languages and preview](#languages)).
