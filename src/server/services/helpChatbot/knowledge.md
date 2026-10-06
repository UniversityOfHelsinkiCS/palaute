<!--
Source of the help chatbot's knowledge, rendered into the system prompt by systemPrompt.ts.
[[section:key]] becomes the UI label in the user's UI language, [[section:key|fi]] the label in the given language.

Rules for editing:
- Write in English and check every fact against the code; the user guide is partly outdated.
- Only describe what users at HY can acually reach: check the config (config/hy.js), the data and the role
  that gates a feature, not just that the code exists.
- Say which survey types and roles a fact applies to. Unqualified facts are read as applying to all.
- When a label depends on the user or the situation, give every variant.
- Keep it compact: every word is sent with every question.
-->

# Norppa

Norppa (norppa.helsinki.fi) is the course feedback system of the University of Helsinki. Students answer feedback surveys; teachers edit the surveys, read the answers and respond to them; degree programmes and faculties follow the feedback of their courses. Course, teacher and student data comes from Sisu. All feedback is anonymous: nobody can link answers to a student.

## How surveys work

- Every survey is upcoming, open or closed, decided only by its opening and closing dates. There's no publish, activate, draft or send step: a survey opens by itself at 00:00 on its opening date and closes at 23:59 on its closing date (Finnish time).
- The questions can be edited only until the survey opens. Each question is saved on its own; there's nothing else to save or publish.
- While a survey is open, students can change or delete their answers.
- After closing, the answers stay available and the survey's responsible persons can write counter feedback for 12 months.

## Survey types

There are three kinds of surveys. When it matters, check which one the user means; many details differ.

**Course survey**: one per course realisation, created automatically from Sisu (see "Which courses get a survey").

- Teachers and students come from Sisu and stay up to date. Has the university level and programme questions.
- Dates: the [[common:edit]] button next to [[feedbackTargetView:feedbackPeriod]] on the course page, with automatic default dates.
- Emails: students get one when it opens; responsible teachers get a reminder a week before it opens, and a counter feedback reminder the day after it closes if it got answers and has no counter feedback yet.
- Has continuous feedback and interim feedback. Appears in [[navBar:courseSummary]].
- Can't be deleted.

**Interim feedback** ([[interimFeedback:interimFeedback]]): an extra survey that a responsible teacher creates under a course survey, e.g. mid-course.

- Same students and teachers as the course. No university level or programme questions, no Sisu groups.
- Its responsible teachers change its dates and name with [[interimFeedback:editSurvey]] on its page, in any state.
- No automatic emails to students or teachers. Not in [[navBar:courseSummary]].
- Found in the course's [[feedbackTargetView:interimFeedbackTab]] tab. Can be removed while it has no answers.

**Programme survey** ([[organisationSettings:organisationSurveysTab]]; on a faculty's page [[organisationSettings:organisationFacultySurveysTab]]): a survey a degree programme's or faculty's admins create on its page, e.g. semester feedback.

- Respondents are students added by student number or by picking courses (their enrolled students are copied in when saved); the list doesn't update by itself. Its [[organisationSurveys:responsibleTeachers]] can edit it and see all its answers; on the survey page they're listed as [[feedbackTargetView:administrativePersons]]. The programme's admins can edit it too. No university level or programme questions.
- Dates, name, responsible persons and respondents: [[organisationSurveys:editSurvey]] on its page, in any state.
- Students get no automatic email. The responsible persons get the counter feedback reminder the day after it closes, if it got answers. Not in [[navBar:courseSummary]].
- Listed for its responsible persons in [[navBar:myCourses]] under [[teacherView:organisationSurveys]]. The programme's admins can remove it from the programme surveys tab while it has no answers.

All three work the same way in the [[feedbackTargetView:surveyQuestionsTab]], [[feedbackTargetView:shareTab]], [[feedbackTargetView:feedbacksTab]] and [[feedbackTargetView:studentsWithFeedbackTab]] tabs and in counter feedback. Only course surveys have the [[feedbackTargetView:continuousFeedbackTab]] and [[feedbackTargetView:interimFeedbackTab]] tabs.

## Roles and rights

### On a course

Course roles come from the course realisation in Sisu and are updated every night. They can't be changed in Norppa; a wrong role must be fixed in Sisu (by whoever maintains the course there, often the programme's study affairs staff). The course page lists the course's [[feedbackTargetView:responsibleTeachers]], [[feedbackTargetView:teachers]] and [[feedbackTargetView:administrativePersons]], which is where users can check their role.

- [[courseSummary:responsibleTeacher]] (Sisu roles responsible teacher and contact person) and [[courseSummary:administrativePerson]] (Sisu role administrative person) have the same rights: edit the survey and its dates, see all answers, send reminders, hide answers, write counter feedback, and use continuous and interim feedback.
- [[courseSummary:teacher]] (any other Sisu teaching role) sees only the answers to public questions and can copy the survey link. For more they need the responsible teacher role in Sisu.
- On courses that started before 2023, everyone listed in Sisu is a responsible teacher.
- A guest lecturer who shows up as a responsible teacher (and gets the reminder emails) has been added in Sisu as responsible teacher, contact person or administrative person. Changing their role to teacher in Sisu fixes it the next night.
- The responsible persons of a programme survey have the responsible teacher's rights on that survey.

### In a degree programme or faculty

Organisation rights come from the university's IAM groups, e.g. a programme director gets admin rights and steering group members read rights. [[navBar:userInformation]] in the user menu lists the user's IAM groups and rights per organisation (Admin or Read, always in English); it doesn't show course roles.

- Read rights: the organisation's statistics and the public answers of its courses.
- Admin rights: all answers of its courses, and its settings, programme questions and programme surveys.
- Someone who doesn't see [[navBar:myProgrammes]] or [[navBar:myOrganisations]] in the menu has no organisation rights. Rights follow IAM group membership, which is managed outside Norppa (e.g. by the programme or faculty administration); [[navBar:userInformation]] shows the user's current groups. Alternatively a programme admin can add them as a feedback liaison.
- A feedback liaison (palautevastaava) gets admin rights to the programme. Liaisons are added by the programme's admins in Norppa (see "Degree programme and faculty pages").

## Finding your way

Top menu (each item is shown only to users it concerns):

- [[navBar:myCourses]]: the user's surveys as a teacher or responsible person, grouped into [[teacherView:courseSurveys]] and [[teacherView:organisationSurveys]]. The tabs follow the course's dates, not the survey's: [[teacherView:activeSurveys]] has courses that are running or have an open survey, [[teacherView:upcomingSurveys]] courses that haven't started, [[teacherView:endedSurveys]] ended courses with no open survey (with a year filter; older years are there too). Chips show the state, e.g. [[teacherView:feedbackOpen]], [[teacherView:feedbackResponseMissing]] or [[teacherView:interimFeedbackOpen]].
- [[navBar:courseSummary]]: feedback statistics of the user's own courses and of organisations they have rights to.
- [[navBar:myProgrammes]] or [[navBar:myOrganisations]]: the degree programmes, faculties and other organisations the user has rights to, each with its own page. The item is called [[navBar:myProgrammes]] only if all of them are degree programmes, otherwise [[navBar:myOrganisations]]; when telling the user to open it, name both.
- [[navBar:browseCourses]]: lists the courses of chosen degree programmes by start date, each with a [[search:coursePageLink]] link to the course's page on studies.helsinki.fi. It's separate from feedback: no feedback or survey information and no links to Norppa's course pages.
- [[navBar:feedback]]: feedback about Norppa itself to its developers.
- [[navBar:myFeedbacks]]: surveys the user can answer as a student. Staff see it when they're enrolled as a student on a course or added as a respondent to a programme survey.
- The user menu (the user's name, top right) has [[navBar:userInformation]] and the UI language (FI/SV/EN).

To find a survey's page: teachers open it from [[navBar:myCourses]]; programme staff also from the programme page's [[organisationSettings:courseRealisationsTab]] tab or from a course unit in [[navBar:courseSummary]]. [[navBar:browseCourses]] doesn't lead there.

A survey's page shows its tabs according to the user's role and the survey's state:

- Teachers see the survey as [[common:preview]] and can't answer it themselves; before opening, responsible teachers get [[feedbackView:editSurvey]] there.
- [[feedbackTargetView:surveyQuestionsTab]]: responsible teachers and programme admins, until the survey closes; disabled while it's open.
- [[feedbackTargetView:giveFeedbackResponseTab]]: responsible teachers after the survey closes, for 12 months; called [[feedbackTargetView:editFeedbackResponseTab]] once the counter feedback email has been sent.
- [[feedbackTargetView:continuousFeedbackTab]] and [[feedbackTargetView:interimFeedbackTab]] (course surveys only): responsible teachers.
- [[feedbackTargetView:shareTab]] and [[feedbackTargetView:feedbacksTab]]: all teachers. [[feedbackTargetView:studentsWithFeedbackTab]]: responsible teachers and programme admins.

## Which courses get a survey

Course surveys are created automatically for course realisations of these Sisu types: lab work, online teaching, field course, project, lectures, small group teaching, seminar, blended teaching, contact teaching and distance teaching (Sisu codes teaching-participation-lab, -online, -field-course, -project, -lectures, -small-group, -seminar, -blended, -contact, -distance), and for Language Centre independent-work projects.

- Other types, such as exams, theses, essays, independent work and training, get no survey. Credits don't matter. Support can enable a survey for some of these types (independent work, essays, training, master's theses) but not for exams.
- No survey either if the realisation is cancelled, archived or a draft in Sisu, has no end date, or isn't linked to a course unit.
- A degree programme's admins can switch feedback off per course unit ([[organisationSettings:settingsTab]] > [[organisationSettings:courseSettings]]), for all its realisations. Teachers then see [[teacherView:disabledCourseWarning]] in [[navBar:myCourses]] and [[feedbackTargetView:feedbackDisabled]] on the course page; students can't open the survey and no emails are sent.
- One realisation has one survey, even if it belongs to several course units.
- Where a course survey isn't available (e.g. an exam, or feedback across several courses), a programme survey can be used.

### Sisu updates

- Courses, teachers, roles and course dates are updated every night; Sisu changes show in Norppa the next morning. A new course's survey also appears the next morning.
- New student enrolments are usually added within 1-2 hours. Only confirmed enrolments (status enrolled) count; if Sisu confirms an enrolment later, the student appears the next morning.
- Answer counts are shown as answers/enrolled students, e.g. 3/20. 0/0 means Norppa has no enrolled students for the course yet: enrolments aren't confirmed in Sisu, or the counts haven't updated yet (overnight and when answers come in).
- A student whose enrolment is cancelled is removed the next night, unless they've already been emailed the survey link or have answered; after that they stay on the survey and count in the enrolled total.
- Groups defined in Sisu (study sub-groups) become groups within the one survey, not separate surveys.

## Changing when a survey is open

**Course survey.** By default it opens at 00:00 on the day after the course's last day in Sisu and closes at 23:59 14 days later, so it's open for about 15 days. Only the course dates in Sisu count, not teaching events; if they run past the teaching (e.g. to include the exam), the survey opens later accordingly.

The course page shows [[feedbackTargetView:coursePeriod]] and [[feedbackTargetView:feedbackPeriod]]. A responsible teacher changes the dates with [[common:edit]] next to the feedback period, which opens [[feedbackTargetSettings:editPeriodTitle]] with [[editFeedbackTarget:opensAt]] and [[editFeedbackTarget:closesAt]]:

- Before the survey opens, both dates can be changed, and [[editFeedbackTarget:openImmediately]] opens it right away and emails the students.
- While it's open, only the closing date can be changed, e.g. extended past grading or moved to today to close it that evening. There's no maximum length and no button to close it at once.
- It must be open at least one day, and dates can't be in the past.
- After it has closed, its dates can't be changed; only support can reopen it.
- Dates saved in Norppa are never overwritten by Sisu. Dates never edited in Norppa follow the course dates in Sisu every night, which is why changing the course dates in Sisu can move the feedback period.

**Interim feedback and programme surveys**: their dates don't follow Sisu (the creation form suggests tomorrow to a week later) and there's no [[editFeedbackTarget:openImmediately]]. Their editors change the dates with [[interimFeedback:editSurvey]] or [[organisationSurveys:editSurvey]] on their page, in any state: to open one now, set its opening date to today (it opens at once, but students get no email, so send a reminder or share the link); a closed one can be reopened by moving its closing date.

## Editing the questions

For all survey types, until the survey opens: the [[feedbackTargetView:surveyQuestionsTab]] tab (or [[feedbackView:editSurvey]] in [[common:preview]]). Once it opens, the questions are locked.

- Course surveys start with the university level questions and possibly the programme's questions, which can't be edited or removed. Students see the university and programme scale and choice questions first, then the teacher's own questions, then the programme and university open questions (so the university's "additional comments" is last). A grouping question is always first.
- [[questionEditor:addQuestion]] adds a question: [[questionEditor:likertQuestion]] (scale 1-5), [[questionEditor:openQuestion]], [[questionEditor:singleChoiceQuestion]] or [[questionEditor:multipleChoiceQuestion]]. [[questionEditor:addTextualContent]] adds a text section. Each question is saved with its own [[questionEditor:done]]. Each question can have a [[questionEditor:description]]. Questions can be marked [[common:required]], duplicated, moved and removed.
- Language versions: the editor has Finnish, Swedish and English fields side by side. Students see the survey in their own UI language; a missing translation is shown in Finnish, or else English, or else Swedish. [[editFeedbackTarget:showPreview]] with [[editFeedbackTarget:translationLanguage]] shows each language.
- Carry-over (course surveys): the first time anyone views a new realisation's survey page in Norppa (or its reminder email is sent), well before the survey opens, it copies the own questions of the latest earlier realisation of the same course unit that shares a teacher with it. After that the surveys are independent. A new version of the course unit in Sisu breaks the chain.
- [[editFeedbackTarget:copyFromCourseButton]] copies questions and adds them after the existing ones: in course surveys from the user's other courses, in programme surveys from other programme surveys. In interim feedback and programme surveys, [[editFeedbackTarget:copyUniversityQuestions]] adds the university level questions.
- Groups: in course surveys with two or more Sisu groups, answers can be viewed by group automatically. In any survey, [[groups:addGroupingQuestion]] adds a question where students choose their group (one per survey; it replaces the Sisu grouping). Answers per group are shown only if each group has either no answers or at least 5.
- Open answers have no practical length limit.

## Getting students to answer

The same for all survey types:

- The [[feedbackTargetView:shareTab]] tab has the [[feedbackTargetView:studentLinkTitle]] with a copy button and the [[feedbackTargetView:studentLinkQRTitle]] (a screenshot is the easiest way to share it), also before the survey opens. The course page also has [[feedbackTargetView:copyLink]].
- While the survey is open, [[feedbackTargetResults:sendReminder]] on the [[feedbackTargetView:shareTab]] tab is the easiest way to email the students: a responsible teacher or programme admin can add a message, and the email, with the link, goes to every student of the survey who hasn't answered yet. It can be sent once every 24 hours. Teachers without the responsible teacher role see the button too, but sending fails for them. Suggest it whenever the user wants answers or wants to tell students about a survey, and especially for interim feedback and programme surveys, which send no email by themselves.
- Course survey students also get an email when it opens, and see open surveys in Norppa.
- Answering is anonymous, so teachers can't tell who answered what, and can't reward individual answers.

## Following the answers

The same for all survey types. The [[feedbackTargetView:feedbacksTab]] tab shows the answers as they come in (reload the page to see new ones).

- Responsible teachers, administrative persons, programme admins and feedback liaisons see all answers. Teachers, programme staff with read rights and students see only questions marked [[common:public]]. Students see them after answering themselves or after the survey closes.
- There's no other visibility setting: each question is just [[common:public]] or [[common:notPublic]].
- Scale and choice questions are public by default; open questions and copied or carried-over questions are [[common:notPublic]]. University level scale and choice questions, and programme questions the programme has made public, are always public.
- A responsible teacher sets a question's publicity on the [[feedbackTargetView:feedbacksTab]] tab (scale and choice questions also in the question editor). An open question can be made public only after the survey has closed, after confirming its answers contain no personal data.
- [[feedbackTargetResults:setHidden]] (eye icon; responsible teachers and programme admins) hides an open answer from those who see only public answers. All identical answers to the question are hidden together.
- Small courses: if fewer than 5 students are enrolled, students must tick [[feedbackView:allowSubmitCheckbox]] to submit, and results are shown only to the responsible teachers. Others see a note that results aren't shown. The limit counts enrolled students in Norppa, not answers.
- Answers are shown in random order per question, so one student's answers can't be linked together.
- The tab shows each question's distribution, mean and median, with chart and table views, and the daily number of answers.

### Who has answered

The [[feedbackTargetView:studentsWithFeedbackTab]] tab (responsible teachers and programme admins) lists the survey's students. Whether each has answered is shown only after the survey has closed, if at least 5 students answered and the programme's setting allows it. It never shows who answered what; [[common:feedbackHidden]] in the list means the status isn't shown yet. The list can be downloaded with [[common:exportXLSX]], and [[feedbackTargetView:copyStudentNumbers]] copies the student numbers.

## Counter feedback

The teacher's reply to all students about the feedback, e.g. what came up and what will change. It shows students their feedback was read. The same for all survey types.

- A responsible teacher writes it on the [[feedbackTargetView:giveFeedbackResponseTab]] tab after the survey has closed, for about a year. There's one shared text per survey; any responsible teacher can edit it.
- The text supports Markdown (formatting and links). There's no image upload.
- [[feedbackResponse:checkboxSendEmail]] emails it to all the survey's students, not only those who answered. The email can be sent only once; after that the tab is called [[feedbackTargetView:editFeedbackResponseTab]] and edits don't send a new email.
- Students read it on the survey's [[feedbackTargetView:feedbacksTab]] tab, under [[feedbackTargetResults:responseHeading]]. After closing, the [[feedbackTargetView:shareTab]] tab has the [[feedbackTargetView:studentResultsLinkTitle]] to send them.
- It was sent when the checkbox says [[feedbackResponse:emailSent]] and [[navBar:myCourses]] shows [[teacherView:feedbackResponseGiven]]. [[teacherView:feedbackResponseNotSent]] means it was saved without the email.
- [[teacherView:feedbackResponseMissing]] is shown in [[navBar:myCourses]] for ended course and programme surveys that got answers but no counter feedback, for about a year (interim feedback has no such chip); the latest one is also flagged on the course unit's row. In [[navBar:courseSummary]] the realisation's figure updates at once, course unit and programme totals overnight.

## Continuous feedback

Course surveys only. Students can give free-form feedback while the course runs.

- A responsible teacher turns it on in the [[feedbackTargetView:continuousFeedbackTab]] tab with [[feedbackTargetView:activateContinuousFeedback]]. It's off by default. An optional text can be shown to students on the form.
- [[feedbackTargetView:activateContinuousFeedbackDigest]]: new continuous feedback is emailed to responsible teachers each morning.
- Students can give it until the survey opens.
- A responsible teacher can reply to each item with [[feedbackTargetView:respondContinuousFeedback]]; the student gets the first reply by email, and later edits to it aren't emailed.
- It's anonymous: teachers don't see who gave it. Teachers can't delete it. Programme admins can read it too.

## Interim feedback

- A responsible teacher creates it in the course's [[feedbackTargetView:interimFeedbackTab]] tab with [[interimFeedback:addSurvey]]: name and dates, then the questions.
- Otherwise see "Survey types". Students get no automatic email, so once it's open, send [[feedbackTargetResults:sendReminder]] or share its link.

## Downloading results and statistics

- The [[feedbackTargetView:feedbacksTab]] tab's [[feedbackTargetResults:export]] offers [[common:exportXLSX]] (one sheet, a column per question, answers shuffled per question, no timestamps or student information) and [[common:exportPdf]]. Responsible teachers and programme staff can download; those who see only public answers get only those.
- [[navBar:courseSummary]] shows averages of the university (and programme) level scale questions, [[courseSummary:feedbackCount]], [[courseSummary:feedbackPercentage]] and [[courseSummary:feedbackResponsePercentage]], by academic year, semester or period, from 2020 onwards. "Cannot answer" isn't counted in the averages, and colours show how high an average is. [[courseSummary:myCourses]] shows the user's own courses as a teacher, [[courseSummary:myOrganisations]] the organisations they have rights to. Its [[common:exportXLSX]] has sheets for organisations, course units and course realisations.
- Course summary covers course surveys only. A course is missing if its survey hasn't opened yet, it has no students, or it belongs to another organisation in Sisu. Courses linked to the programme only via their realisation are marked partially responsible. The figures are recalculated overnight.
- A teacher's older surveys are in [[navBar:myCourses]] > [[teacherView:endedSurveys]].

## Degree programme and faculty pages

Open [[navBar:myProgrammes]] or [[navBar:myOrganisations]] and choose the programme or faculty. Its tabs (some only for admins):

- [[organisationSettings:summaryTab]]: its course summary.
- [[organisationSettings:openQuestionsTab]] (admins): all answers to the university and programme level open questions of its courses.
- [[organisationSettings:courseRealisationsTab]]: its course realisations.
- [[organisationSettings:surveyTab]] (faculties: [[organisationSettings:surveyFacultyTab]]) (admins): questions added to all its course surveys. In the survey, its scale and choice questions come after the university ones and its open questions after the teacher's own questions.
- [[organisationSettings:organisationSurveysTab]] (faculties: [[organisationSettings:organisationFacultySurveysTab]]) (admins): its programme surveys.
- [[organisationSettings:responsiblesTab]]: its teachers and their course counts.
- [[organisationSettings:settingsTab]] (admins): [[organisationSettings:feedbackCorrespondents]], [[organisationSettings:studentListVisibility]] (whether responsible teachers see who has answered, for all courses or per course) and [[organisationSettings:courseSettings]] ([[organisationSettings:feedbackEnabled]] per course unit).

### Adding a feedback liaison

[[navBar:myProgrammes]] or [[navBar:myOrganisations]] > the programme > [[organisationSettings:settingsTab]] > [[organisationSettings:newCorrespondent]]: search by email or name (at least 5 characters), then [[organisationSettings:setAsCorrespondent]]. The person must be university staff and have logged in to Norppa once. They get admin rights to the programme.

### Creating a programme survey

1. On the programme's page, open [[organisationSettings:organisationSurveysTab]] (on a faculty's page [[organisationSettings:organisationFacultySurveysTab]]) and click [[organisationSurveys:addSurvey]] (admins only).
2. Give the name, dates, [[organisationSurveys:responsibleTeachers]] (university staff) and the respondents: pasted student numbers or [[organisationSurveys:addCourses]]. Only those students can answer. Save.
3. Write the questions in its [[feedbackTargetView:surveyQuestionsTab]] tab. There are no university level or programme questions.
4. Nothing else is needed: it opens by itself on its opening date. Students get no email automatically, so once it's open, send [[feedbackTargetResults:sendReminder]] from its [[feedbackTargetView:shareTab]] tab, or share its link.

Results are on its [[feedbackTargetView:feedbacksTab]] tab, and the responsible persons get a counter feedback reminder when it closes.

## Emails Norppa sends

- Course surveys: one week before opening, responsible teachers get a reminder with the dates and the survey's own questions (once). At 11:15 on the opening day (at once if opened with [[editFeedbackTarget:openImmediately]]), students get an email with the link; students who enrol later get it at 11:15 on a later day. The day after closing, responsible teachers get a counter feedback reminder, if there were answers and no counter feedback yet.
- Programme surveys: only the counter feedback reminder to the responsible persons.
- Interim feedback: none.
- Any survey: the reminder a responsible teacher or programme admin sends with [[feedbackTargetResults:sendReminder]], and the counter feedback email if the teacher sends it. There are no automatic reminders to students.
- Continuous feedback digest: see "Continuous feedback".

## University level questions

Set by the university for all course surveys. The version depends on when the survey opens. Surveys opening from 2 August 2026 have these (Finnish / Swedish / English):

1. Kurssin rakenne ja aikataulu olivat selkeät / Kursens struktur och tidtabell var tydliga / The course structure and schedule were clear
2. Kurssilla oli selvästi esitetty se, mitä meidän tulisi oppia / Det framgick tydligt på kursen vad vi förväntades lära oss / The intended learning outcomes of the course were clearly communicated
3. Opetustilanteissa opiskelijoita kannustettiin keskustelemaan ajatuksistaan ja näkökulmistaan / Under undervisningstillfällena uppmuntrades studenterna att diskutera sina tankar och perspektiv / Students were encouraged to discuss their ideas and perspectives during teachings
4. Oppimisen arvioinnin vaatimukset (tentti, harjoitus, kurssisuoritus) olivat minulle selvät / Bedömningsgrunderna (tentamen, övning, kursprestation) var tydliga för mig / The requirements for assessment (examination, assignment, course performance) were clear to me
5. Kurssilla käytetyt menetelmät auttoivat minua luomaan yhteyksiä opiskeltavien asioiden ja aikaisempien tietojeni välillä / De metoder som användes på kursen hjälpte mig att skapa kopplingar mellan det studerade innehållet och mina tidigare kunskaper / The methods used in the course helped me make connections between the course content and my prior knowledge
6. Työmäärä suhteessa opintopisteisiin oli (raskas ... kevyt) / Arbetsmängden i förhållande till studiepoängen var (tung ... lätt) / The workload in relation to the credits awarded was (heavy ... light), five options
7. Muita huomioita (avoin kysymys) / Övriga kommentarer (öppen fråga) / Additional comments (open question)

Questions 1-5 use the scale 1 = completely disagree ... 5 = completely agree, and "cannot answer".

Surveys that opened earlier (from autumn 2021) had: the learning objectives were clear; the course activities supported my learning; the course materials supported my learning; the assessment methods measured my learning; the same workload question as now; other comments.

## Not available in Norppa

Don't suggest these; they don't exist:

- publishing, activating or sending a survey (surveys open by their dates);
- students marking that they won't answer;
- seeing which student gave which answers, or rewarding students for answering;
- uploading images or attachments, or file upload questions;
- conditional questions that appear depending on earlier answers;
- changing course roles in Norppa (they come from Sisu);
- teachers deleting answers or continuous feedback (responsible teachers and programme admins can only hide open answers);
- choosing an audience for the answers, such as everyone or staff only (each question is only public or not public);
- automatic reminder emails to students during the feedback period;
- a survey for an exam realisation;
- deleting a course survey.

## When to contact support

Support is norppa@helsinki.fi. Suggest it only when the user can't solve the problem in Norppa or Sisu: reopening or changing the dates of a closed course survey, a survey for a course type that doesn't get one automatically, a course or student still missing a few days after the Sisu data was fixed, or an error that persists.

## Glossary

Terms in Finnish / Swedish / English:

- survey: [[teacherView:survey|fi]] / [[teacherView:survey|sv]] / [[teacherView:survey|en]]
- counter feedback: [[feedbackResponse:responseLabel|fi]] / motrespons (the Swedish UI also says [[feedbackResponse:responseLabel|sv]]) / [[feedbackResponse:responseLabel|en]]
- continuous feedback: [[teacherView:continuousFeedback|fi]] / [[teacherView:continuousFeedback|sv]] / [[teacherView:continuousFeedback|en]]
- interim feedback: [[interimFeedback:interimFeedback|fi]] / [[interimFeedback:interimFeedback|sv]] / [[interimFeedback:interimFeedback|en]]
- responsible teacher: [[courseSummary:responsibleTeacher|fi]] / [[courseSummary:responsibleTeacher|sv]] / [[courseSummary:responsibleTeacher|en]]
- teacher: [[courseSummary:teacher|fi]] / [[courseSummary:teacher|sv]] / [[courseSummary:teacher|en]]
- administrative person: [[courseSummary:administrativePerson|fi]] / [[courseSummary:administrativePerson|sv]] / [[courseSummary:administrativePerson|en]]
- feedback liaison: [[organisationSettings:feedbackCorrespondent|fi]] / [[organisationSettings:feedbackCorrespondent|sv]] / [[organisationSettings:feedbackCorrespondent|en]]
- programme surveys: [[organisationSettings:organisationSurveysTab|fi]] / [[organisationSettings:organisationSurveysTab|sv]] / [[organisationSettings:organisationSurveysTab|en]]
- programme questions: [[organisationSettings:surveyTab|fi]] / [[organisationSettings:surveyTab|sv]] / [[organisationSettings:surveyTab|en]]
- university level questions: [[courseSummary:universityLevelQuestions|fi]] / [[courseSummary:universityLevelQuestions|sv]] / [[courseSummary:universityLevelQuestions|en]]
- course unit: [[courseSummary:courseUnit|fi]] / [[courseSummary:courseUnit|sv]] / [[courseSummary:courseUnit|en]]
- course realisation: [[courseSummary:courseRealisation|fi]] / [[courseSummary:courseRealisation|sv]] / [[courseSummary:courseRealisation|en]]
- study programme: [[navBar:myProgrammes|fi]] / [[navBar:myProgrammes|sv]] / [[navBar:myProgrammes|en]]
- respondents: [[feedbackTargetView:respondents|fi]] / [[feedbackTargetView:respondents|sv]] / [[feedbackTargetView:respondents|en]] (the tab listing them: [[feedbackTargetView:studentsWithFeedbackTab|fi]] / [[feedbackTargetView:studentsWithFeedbackTab|sv]] / [[feedbackTargetView:studentsWithFeedbackTab|en]])

## User guide pages

The user guide is partly outdated; where it differs from this documentation, this documentation is right. Link a page only when it adds to the answer.

- Course realisation types: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/1.%20General%20info/Norppa%20course%20realisation%20types/
- University level questions: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/2.%20HY%20yhteiset%20kysymykset%20%20joint%20questions/
- Teacher's guide: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/3.%20Teacher%27s%20guide/ (in Finnish: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/3.%20Opettajan%20ohje/)
- Counter feedback: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/3.%20Teacher%27s%20guide/counter%20feedback/ (in Finnish: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/3.%20Opettajan%20ohje/vastapalaute/)
- Continuous and interim feedback (in Finnish): https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/3.%20Opettajan%20ohje/jatkuva%20palaute/
- Degree programme's guide: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/4.%20Degree%20programme%27s%20guide/ (in Finnish: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/4.%20Koulutusohjelman%20ohje/)
- Programme surveys: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/4.%20Degree%20programme%27s%20guide/organisation%20survey/ (in Finnish: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/4.%20Koulutusohjelman%20ohje/Koulutusohjelman%20kysely/)
- Data protection: https://wiki.helsinki.fi/xwiki/bin/view/CF/Course%20feedback/5.%20Tietosuoja%20%20Data%20protection%20notice/
