# Survey questions

A course survey always has the university level questions and possibly questions from the degree programme. Neither can be changed. You can add your own questions until the survey opens.

## Editing the questions {#edit-questions}

Who can edit the questions:

- Course survey: the course's responsible teachers and administrative persons, and the admins of the course's degree programme. See [Roles and rights](/guide/roles#course-roles).
- Interim feedback: the course's responsible teachers.
- Programme survey: its responsible persons and the programme's admins.

You can edit the questions only until the survey opens. After that the [[feedbackTargetView:surveyQuestionsTab]] tab is greyed out, so that all students answer the same questions, and once the survey has closed, the tab is gone.

To add a question:

1. Open the survey from [[navBar:myCourses]].
2. Open the [[feedbackTargetView:surveyQuestionsTab]] tab.
3. Below the questions, click [[questionEditor:addQuestion]] and choose the [type of question](#question-types).
4. Write the question in the Finnish, Swedish and English fields. You can also add a [[questionEditor:description]], e.g. to explain the question.
5. If students must answer the question, switch on [[common:required]].
6. Click [[questionEditor:done]].

The question is saved right away. There's nothing else to save or publish: the questions in the editor when the survey opens are the ones students get.

Each of your own questions has these buttons, and each change is saved at once:

- [[common:edit]] opens the question again. [[common:cancel]] in the dialog discards your changes.
- [[questionEditor:duplicate]] adds a copy right after it.
- The arrows ([[questionEditor:moveUp]] and [[questionEditor:moveDown]]) move it among your own questions.
- [[questionEditor:removeQuestion]] removes it after you confirm. To remove several questions at once, use [[questionEditor:removeMany]] below the questions.

[[questionEditor:addTextualContent]] adds a _text section_ instead of a question, e.g. instructions or a heading for the questions after it. Text sections and question descriptions support Markdown, e.g. links and lists.

The editing dialog of a scale or choice question also lets you choose whether its answers are public. See [Who sees the answers](/guide/results#public-answers).

## Question types {#question-types}

- [[questionEditor:likertQuestion]]: a statement answered on a scale from 1 to 5, with a separate option for "can't answer" (_N/A_, in Finnish _eos_). The numbers have no labels, so say in the question or its description what 1 and 5 mean, e.g. 1 = completely disagree, 5 = completely agree.
- [[questionEditor:openQuestion]]: the student writes their answer.
- [[questionEditor:singleChoiceQuestion]]: the student picks one of the options. Add the options with [[questionEditor:addOption]]. A choice question needs at least one option.
- [[questionEditor:multipleChoiceQuestion]]: the student picks any number of the options.

There are no conditional questions that appear depending on earlier answers, and no file uploads.

## University level questions {#university-questions}

The university sets these questions for all course surveys. They're the same for every course and can't be edited or removed. In the editor they're marked [[questionEditor:universityQuestion]]. Interim feedback and programme surveys don't have them, but you can [add copies of them](#copy-questions).

Course surveys that open on 2 August 2026 or later start with a text explaining the scale, followed by these questions (in English, Finnish and Swedish):

1. The course structure and schedule were clear. _Kurssin rakenne ja aikataulu olivat selkeät. / Kursens struktur och tidtabell var tydliga._
2. The intended learning outcomes of the course were clearly communicated. _Kurssilla oli selvästi esitetty se, mitä meidän tulisi oppia. / Det framgick tydligt på kursen vad vi förväntades lära oss._
3. Students were encouraged to discuss their ideas and perspectives during teachings. _Opetustilanteissa opiskelijoita kannustettiin keskustelemaan ajatuksistaan ja näkökulmistaan. / Under undervisningstillfällena uppmuntrades studenterna att diskutera sina tankar och perspektiv._
4. The requirements for assessment (examination, assignment, course performance) were clear to me. _Oppimisen arvioinnin vaatimukset (tentti, harjoitus, kurssisuoritus) olivat minulle selvät. / Bedömningsgrunderna (tentamen, övning, kursprestation) var tydliga för mig._
5. The methods used in the course helped me make connections between the course content and my prior knowledge. _Kurssilla käytetyt menetelmät auttoivat minua luomaan yhteyksiä opiskeltavien asioiden ja aikaisempien tietojeni välillä. / De metoder som användes på kursen hjälpte mig att skapa kopplingar mellan det studerade innehållet och mina tidigare kunskaper._
6. The workload in relation to the credits awarded was: heavy, fairly heavy, appropriate, fairly light, light. _Työmäärä suhteessa opintopisteisiin oli: raskas, melko raskas, sopiva, melko kevyt, kevyt. / Arbetsmängden i förhållande till studiepoängen var: tung, ganska tung, lämplig, ganska lätt, lätt._
7. Additional comments (open-ended question). _Muita huomioita (avoin kysymys). / Övriga kommentarer (öppen fråga)._

Questions 1–5 are answered on the scale 1 = completely disagree ... 5 = completely agree, or N/A.

Which set a survey gets depends on its opening date. Surveys that opened earlier, from autumn 2021, had a different set: four statements (the learning objectives were clear, the course activities supported my learning, the materials supported my learning, the assessment methods measured my learning), a workload question and the open question _Other comments_.

The averages of the university level scale questions are what [Course summary](/guide/course-summary#figures) shows.

## Programme questions {#programme-questions}

A degree programme or a faculty can add its own questions to the course surveys of all its course units. In the editor they're marked [[questionEditor:programmeQuestion]], and the box at the top of the [[feedbackTargetView:surveyQuestionsTab]] tab tells how many there are and which organisation added them.

Teachers can't edit or remove programme questions. If one doesn't suit your course, contact the programme. Interim feedback and programme surveys don't have programme questions.

Programme staff add and edit these questions on the programme's page: see [Programme questions](/guide/programmes#programme-questions).

## The order students see {#question-order}

The editor lists the university level questions first, then the programme questions, then your own. Students see them in this order:

1. The grouping question, if the survey has one (see [Groups](#groups)).
2. The university level scale and choice questions.
3. The programme's scale and choice questions.
4. Your own questions and text sections, in the order you've set.
5. The programme's open questions.
6. The university level open question, so _Additional comments_ is always last.

To check the result, use [[editFeedbackTarget:showPreview]] (see [Languages and preview](#languages)).

## Questions from the previous realisation {#carry-over}

Course surveys only. When a new course realisation's survey is opened in Norppa for the first time, Norppa copies the teacher's own questions from the previous realisation of the same course unit. This happens a week before the survey opens at the latest, when the responsible teachers get their reminder email.

- The previous realisation is the latest one that started before this one and has at least one teacher in common with it, in any teaching role.
- It's a one-time copy. After it, changes to either survey don't affect the other.
- The copied questions aren't public until you make them public.
- A grouping question is copied too. Check that its options match this realisation's groups.
- Remove the questions you don't need, as usual.

Nothing is copied if no earlier realisation has a teacher in common with this one, or if the course unit has a new version in Sisu, e.g. for a new curriculum period. Then [copy the questions yourself](#copy-questions).

## Copying questions from another survey {#copy-questions}

To copy your own questions from another course survey into a course survey:

1. On the [[feedbackTargetView:surveyQuestionsTab]] tab, click [[editFeedbackTarget:copyFromCourseButton]].
2. Choose the course in the course field. It lists the courses you teach.
3. The course's realisations that you've taught and that have their own questions are listed with their question counts. Hover over a realisation to see its questions.
4. Click [[editFeedbackTarget:copyQuestionsButton]] next to the realisation.

The questions are added after your existing questions and saved at once. Only the teacher's own questions are copied, not the university level or programme questions. Copied questions aren't public until you make them public.

In interim feedback and programme surveys, [[editFeedbackTarget:copyFromCourseButton]] lists programme surveys instead: those of the degree programmes and faculties where you have admin rights. There's also [[editFeedbackTarget:copyUniversityQuestions]], which adds the university level questions as your own questions, so you can edit or remove them.

## Languages and preview {#languages}

Students see the survey in the language they use Norppa in: Finnish, Swedish or English. That's why the editor has a field for each language side by side. Fill in at least the languages your students use. If a field is empty, students using that language see the question in Finnish, or if that's empty too, in English, or else in Swedish.

To see the survey as students will:

1. At the bottom of the [[feedbackTargetView:surveyQuestionsTab]] tab, choose the language in [[editFeedbackTarget:translationLanguage]]. The questions in the editor switch to that language.
2. Click [[editFeedbackTarget:showPreview]].

The [[common:preview]] tab shows the whole survey in the order students see it. Teachers can't submit it. Responsible teachers return to editing with [[feedbackView:editSurvey]].

## Groups {#groups}

If a course has study groups in Sisu, e.g. exercise groups, Norppa knows which students belong to which group. In a course survey with two or more Sisu groups, the answers can be viewed by group on the [[feedbackTargetView:feedbacksTab]] tab without you doing anything. The groups and their students and teachers are listed under [[groups:groupingInfo]] at the top of the [[feedbackTargetView:surveyQuestionsTab]] tab.

If the course has no groups in Sisu, or they don't suit you, add a _grouping question_, in any type of survey:

1. On the [[feedbackTargetView:surveyQuestionsTab]] tab, click [[groups:addGroupingQuestion]].
2. Edit the question and its options. If the course has groups in Sisu, they're the default options.
3. Click [[questionEditor:done]].

The grouping question is required, it's always the first question students see, and its answers aren't public. A survey can have only one, and it replaces the Sisu groups. To go back to the Sisu groups, remove the grouping question.

To protect anonymity, answers are shown by group only if each group has either no answers or at least 5. So keep the number of options small.
