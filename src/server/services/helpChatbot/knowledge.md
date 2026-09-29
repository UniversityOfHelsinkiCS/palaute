<!--
Source of the help chatbot's knowledge, rendered into the system prompt by systemPrompt.ts.
[[section:key]] becomes the UI label in the user's UI language, [[section:key|fi]] the label in the given language.
Write in English, check facts against the code (the user guide is partly outdated) and keep it compact:
every word is sent with every question.
-->

# Norppa

Norppa (norppa.helsinki.fi) is the course feedback system of the University of Helsinki. Students answer course feedback surveys; teachers edit the surveys, read the answers and respond to them; degree programmes follow feedback of their courses. Course, teacher and student data comes from Sisu. All feedback is anonymous: nobody can link answers to a student.

## Roles on a course

Roles come from the course realisation in Sisu and are updated every night. They can't be changed in Norppa; a wrong role must be fixed in Sisu (by whoever maintains the course there, often the programme's study affairs staff).

- [[courseSummary:responsibleTeacher]]: Sisu roles responsible teacher and contact person. Can edit the survey and the feedback period, see all answers, write counter feedback, use continuous and interim feedback, send reminders and hide answers.
- [[courseSummary:administrativePerson]]: Sisu role administrative person. Same rights as a responsible teacher, listed separately.
- [[courseSummary:teacher]]: any other Sisu teaching role. Sees only the answers to public questions (see Visibility) and can share the survey link. If they need more, they must ask for the responsible teacher role in Sisu.
- The course page lists the course's [[feedbackTargetView:responsibleTeachers]], [[feedbackTargetView:teachers]] and [[feedbackTargetView:administrativePersons]]; that's where a user can check their role.
- On courses that started before 2023, everyone listed in Sisu is a responsible teacher.
- A guest lecturer who shows up as responsible teacher (and gets the reminder emails) has been added in Sisu as responsible teacher, contact person or administrative person. Changing their role to teacher in Sisu fixes it the next night.

## Navigation

Top menu items (each shown only to users it concerns):

- [[navBar:myCourses]]: the user's course surveys as a teacher, in tabs [[teacherView:activeSurveys]], [[teacherView:upcomingSurveys]] and [[teacherView:endedSurveys]], grouped into [[teacherView:courseSurveys]] and [[teacherView:organisationSurveys]]. Chips show the state, e.g. [[teacherView:feedbackResponseMissing]].
- [[navBar:courseSummary]]: feedback statistics of the user's own courses and of organisations they have rights to.
- [[navBar:myProgrammes]] (or [[navBar:myOrganisations]]): the degree programmes or other organisations the user has rights to, each with its own page (see Degree programmes).
- [[navBar:browseCourses]]: lists the courses of chosen degree programmes by start date for a year, semester or period, each with a [[search:coursePageLink]] link to the course's page on studies.helsinki.fi. It's separate from feedback: it shows no feedback or survey information and doesn't link to Norppa's course pages.
- [[navBar:feedback]]: feedback about Norppa itself to its developers.
- [[navBar:myFeedbacks]]: surveys the user can answer as a student. Staff see this when they are enrolled as a student on some course or were added as a respondent to a programme survey.
- The user menu (the user's name, top right) has [[navBar:userInformation]], which lists the user's IAM groups and organisation access rights (not course roles), and the UI language selection (FI/SV/EN).

## Which courses get a survey

A survey is created automatically for each course realisation of these Sisu types: lab work, online teaching, field course, project, lectures, small group teaching, seminar, blended teaching, contact teaching and distance teaching (Sisu codes teaching-participation-lab, -online, -field-course, -project, -lectures, -small-group, -seminar, -blended, -contact, -distance). Language Centre independent-work projects are also included.

- Other types, such as exams, theses, essays, independent work and training, get no survey. Credits don't matter. Support (norppa@helsinki.fi) can enable a survey for some of these types (independent work, essays, training, master's theses) but not for exams.
- Also no survey: the realisation is cancelled, archived or a draft in Sisu, has no end date, or isn't linked to a course unit.
- A degree programme can switch feedback off per course unit (Course settings, see Degree programmes). The teacher then sees [[teacherView:disabledCourseWarning]], students can't answer and no emails are sent.
- One realisation has one survey. Several course units sharing a realisation still share one survey.
- If there's no suitable survey, e.g. for an exam or for feedback across several courses, a degree programme can create a programme survey instead.

## Sisu updates

- Courses, teachers, roles and the course dates are updated every night. Changes made in Sisu show in Norppa the next morning.
- New student enrolments are usually added within 1-2 hours. Only confirmed enrolments (status enrolled) count; if Sisu confirms an enrolment later than that, the student appears the next morning.
- Answer counts are shown as answers/enrolled students, e.g. 3/20. 0/0 means Norppa has no enrolled students for the course yet: enrolments aren't confirmed in Sisu, or the counts haven't updated yet (they update overnight and when answers come in).
- A student whose enrolment is cancelled is removed the next night, unless they have already been emailed the survey link or have answered. After that they stay on the survey even if they drop out, and count in the enrolled total.
- Groups defined in Sisu (study sub-groups) are shown as groups in the same survey, not as separate surveys.

## Feedback period

Default: the survey opens at 00:00 on the day after the course's last day in Sisu and closes at 23:59 (Finnish time) 14 days later, so it's open for about 15 days. Only the course dates in Sisu count, not individual teaching events. If the course's dates in Sisu run past the teaching (e.g. to include the exam), the survey opens later accordingly.

The course page shows [[feedbackTargetView:coursePeriod]] and [[feedbackTargetView:feedbackPeriod]]. A responsible teacher changes the dates with the [[common:edit]] button next to the feedback period, which opens [[feedbackTargetSettings:editPeriodTitle]] with [[editFeedbackTarget:opensAt]] and [[editFeedbackTarget:closesAt]]:

- Before the survey opens, both dates can be changed. [[editFeedbackTarget:openImmediately]] opens it right away and emails the students.
- While it's open, only the closing date can be changed, e.g. extended past grading. There is no maximum length.
- The survey must be open at least one day. Dates can't be in the past. Opening happens at 00:00 and closing at 23:59 of the chosen days.
- After it has closed, the dates can't be changed; only support can reopen a survey.
- Dates saved in Norppa are never overwritten by Sisu. Dates that were never edited in Norppa follow the course dates in Sisu every night, which is why changing the course dates in Sisu can move the feedback period.

## Emails

- One week before the survey opens, responsible teachers get a reminder with the dates and the survey's own questions. It's sent only once.
- At 11:15 on the opening day, students get an email with the link. Students who enrol later get it at 11:15 on a later day.
- The day after the survey closes, responsible teachers get a reminder to write counter feedback, if there was at least one answer and no counter feedback yet.
- There are no automatic reminders to students during the period. Teachers can send one themselves (see Getting students to answer).
- Continuous feedback digest: see Continuous feedback.

## Editing the survey

The survey can be edited until it opens. It's edited on the course page's [[feedbackTargetView:surveyQuestionsTab]] tab (or [[feedbackView:editSurvey]] in the [[common:preview]] tab); once feedback opens, the tab is locked and the questions can no longer be changed.

- Every survey has the university level questions and possibly the degree programme's questions, which can't be edited or removed. Students see the university and programme scale and choice questions first, then the teacher's own questions, then the programme and university open questions (so the university's "additional comments" is last). A grouping question is always first.
- [[questionEditor:addQuestion]] adds a question: [[questionEditor:likertQuestion]] (scale 1-5), [[questionEditor:openQuestion]], [[questionEditor:singleChoiceQuestion]] or [[questionEditor:multipleChoiceQuestion]]. [[questionEditor:addTextualContent]] adds a text section. Each question is saved with its own [[questionEditor:done]] button. Questions can be marked [[common:required]], duplicated, moved and removed.
- Language versions: the editor has Finnish, Swedish and English fields side by side; fill in the languages you want. Students see the survey in their own UI language; a missing translation falls back to another language. [[editFeedbackTarget:showPreview]] and [[editFeedbackTarget:translationLanguage]] show how it looks.
- Carry-over: when a new realisation's survey is first opened in Norppa (or its reminder email is sent), it copies the own questions of the latest earlier realisation of the same course unit that shares a teacher with it. After that the surveys are independent. A new version of the course unit in Sisu breaks the chain.
- [[editFeedbackTarget:copyFromCourseButton]] copies questions from any course where the user is a teacher. Copied questions are added after the existing ones.
- Groups: if the course has two or more groups in Sisu, answers can be viewed by group automatically. [[groups:addGroupingQuestion]] adds a question where students choose their group instead (one per survey; it replaces the Sisu grouping). Answers per group are shown only if each group has either no answers or at least 5.
- Open answers have no practical length limit.

## University level questions

Set by the university for all course surveys. The version in use depends on when the survey opens. Surveys opening from August 2026 have these (Finnish / Swedish / English):

1. Kurssin rakenne ja aikataulu olivat selkeät / Kursens struktur och tidtabell var tydliga / The course structure and schedule were clear
2. Kurssilla oli selvästi esitetty se, mitä meidän tulisi oppia / Det framgick tydligt på kursen vad vi förväntades lära oss / The intended learning outcomes of the course were clearly communicated
3. Opetustilanteissa opiskelijoita kannustettiin keskustelemaan ajatuksistaan ja näkökulmistaan / Under undervisningstillfällena uppmuntrades studenterna att diskutera sina tankar och perspektiv / Students were encouraged to discuss their ideas and perspectives during teachings
4. Oppimisen arvioinnin vaatimukset (tentti, harjoitus, kurssisuoritus) olivat minulle selvät / Bedömningsgrunderna (tentamen, övning, kursprestation) var tydliga för mig / The requirements for assessment (examination, assignment, course performance) were clear to me
5. Kurssilla käytetyt menetelmät auttoivat minua luomaan yhteyksiä opiskeltavien asioiden ja aikaisempien tietojeni välillä / De metoder som användes på kursen hjälpte mig att skapa kopplingar mellan det studerade innehållet och mina tidigare kunskaper / The methods used in the course helped me make connections between the course content and my prior knowledge
6. Työmäärä suhteessa opintopisteisiin oli (raskas ... kevyt) / Arbetsmängden i förhållande till studiepoängen var (tung ... lätt) / The workload in relation to the credits awarded was (heavy ... light), five options
7. Muita huomioita (avoin kysymys) / Övriga kommentarer (öppen fråga) / Additional comments (open question)

Questions 1-5 use the scale 1 = completely disagree ... 5 = completely agree, and "cannot answer".

Surveys that opened earlier (from autumn 2021) had: the learning objectives were clear; the course activities supported my learning; the course materials supported my learning; the assessment methods measured my learning; the same workload question as now; other comments.

## Getting students to answer

The [[feedbackTargetView:shareTab]] tab has the [[feedbackTargetView:studentLinkTitle]] with a copy button and a [[feedbackTargetView:studentLinkQRTitle]] (a screenshot is the easiest way to share it). Both are always there, also before the survey opens. The course page also has [[feedbackTargetView:copyLink]]. Students also find the survey in Norppa and in the email they get when it opens.

While the survey is open, a responsible teacher can use [[feedbackTargetResults:sendReminder]] on the [[feedbackTargetView:shareTab]] tab: they can add a message, and the email (with the link) goes to enrolled students who haven't answered or said they won't answer. It can be sent once every 24 hours.

Answering is anonymous, so teachers can't tell which students answered with what, and can't reward individual answers.

## Visibility of answers

The [[feedbackTargetView:feedbacksTab]] tab shows the answers as soon as they come in (reload the page to see new ones).

- Responsible teachers, administrative persons, programme admins and feedback liaisons see all answers.
- Teachers, other programme staff and students see only questions marked [[common:public]]. Students see the answers after they've answered themselves or after the survey closes.
- Scale and choice questions are public by default; open questions and copied or carried-over questions are [[common:notPublic]]. University level scale and choice questions, and programme questions the programme has made public, are always public.
- A responsible teacher sets a question's publicity on the [[feedbackTargetView:feedbacksTab]] tab (scale and choice questions also in the survey editor). An open question can be made public only after the survey has closed, after confirming that its answers contain no personal data.
- [[feedbackTargetResults:setHidden]] (eye icon) hides an open answer from those who see only public answers. All identical answers to the question are hidden together.
- Small courses: if fewer than 5 students are enrolled, results are shown only to the responsible teachers, and only the answers of students who agreed, when answering, that the teacher may see their answers. Others see a note that results aren't shown. The limit counts enrolled students in Norppa, not answers.
- Answers are shown in random order per question, so one student's answers can't be linked together.

## Respondents

The [[feedbackTargetView:studentsWithFeedbackTab]] tab (responsible teachers and programme admins) lists the enrolled students. Whether each has answered is shown only after the survey has closed, if at least 5 students answered and the degree programme's setting allows it. It never shows who answered what.

## Counter feedback

Counter feedback is the teacher's reply to the whole course about the feedback: e.g. a summary of what came up and what will change. It shows students their feedback was read.

- A responsible teacher writes it on the [[feedbackTargetView:giveFeedbackResponseTab]] tab after the survey has closed, up to 12 months later. There's one shared text per course; any responsible teacher can edit it.
- The text supports Markdown (formatting and links). There's no image upload.
- [[feedbackResponse:checkboxSendEmail]] emails it to all enrolled students, not only those who answered. The email can be sent only once; the text can be edited afterwards on [[feedbackTargetView:editFeedbackResponseTab]] without a new email.
- It was sent when the checkbox says [[feedbackResponse:emailSent]] and [[navBar:myCourses]] shows [[teacherView:feedbackResponseGiven]]. [[teacherView:feedbackResponseNotSent]] means it was saved without sending the email.
- [[teacherView:feedbackResponseMissing]] is shown for ended realisations that got answers but no counter feedback, for 12 months after closing; the latest one is also flagged on the course unit's row. In [[navBar:courseSummary]] the realisation's figure updates at once, course unit and programme totals overnight.

## Continuous feedback

Lets students give free-form feedback while the course is running.

- A responsible teacher turns it on in the [[feedbackTargetView:continuousFeedbackTab]] tab with [[feedbackTargetView:activateContinuousFeedback]]. It's off by default. An optional text can be shown to students on the form.
- [[feedbackTargetView:activateContinuousFeedbackDigest]]: new continuous feedback is emailed to responsible teachers each morning.
- Students can give it until the actual survey opens (if feedback is switched off for the course, until the survey's closing date).
- The teacher can reply to each item with [[feedbackTargetView:respondContinuousFeedback]]; the student gets the reply by email.

## Interim feedback

A separate mid-course survey.

- A responsible teacher creates it in the [[feedbackTargetView:interimFeedbackTab]] tab with [[interimFeedback:addSurvey]]: name, dates, then the questions.
- It has the course's students and teachers but no university or programme questions ([[editFeedbackTarget:copyUniversityQuestions]] can add the university ones). Students get no automatic email about it, so share its link.
- Results work like the main survey. It can be removed while it has no answers.

## Downloading results

- The [[feedbackTargetView:feedbacksTab]] tab's [[feedbackTargetResults:export]] offers [[common:exportXLSX]] (one sheet, a column per question, answers shuffled per question, no timestamps or student information) and [[common:exportPdf]]. Responsible teachers and programme staff can download them; those who see only public answers get only those.
- [[navBar:courseSummary]] has [[common:exportXLSX]] with sheets for organisations, course units and course realisations: averages of the summary questions, student and feedback counts and counter feedback percentage.

## Course summary

[[navBar:courseSummary]] shows averages of the university (and programme) level scale questions, [[courseSummary:feedbackCount]], [[courseSummary:feedbackPercentage]] and [[courseSummary:feedbackResponsePercentage]], by academic year, semester or period, from 2020 onwards.

- [[courseSummary:myCourses]] shows the user's own courses as teacher. [[courseSummary:myOrganisations]] shows the organisations the user has rights to.
- A course is missing if its survey hasn't opened yet, it has no students, or it belongs to another organisation in Sisu. Courses of the programme via their realisation only are marked partially responsible. The figures are recalculated overnight.
- A teacher's older surveys are in [[navBar:myCourses]] > [[teacherView:endedSurveys]].

## Degree programmes

Programme rights come from the university's IAM groups: e.g. the programme director gets admin rights and steering group members read rights. [[navBar:userInformation]] shows the user's rights per organisation (Admin or Read, always in English).

- Read rights: the programme's statistics and public answers.
- Admin rights (programme director, feedback liaison): all answers of the programme's courses, and the programme's settings.

The programme's page ([[navBar:myProgrammes]], or [[navBar:myOrganisations]] for e.g. faculty staff, > the programme) has these tabs:

- [[organisationSettings:summaryTab]]: the programme's course summary.
- [[organisationSettings:openQuestionsTab]] (admins): all answers to the university and programme level open questions of the programme's courses.
- [[organisationSettings:courseRealisationsTab]]: the programme's course realisations.
- [[organisationSettings:surveyTab]] (admins): questions added to all course surveys of the programme. In the survey, the programme's scale and choice questions come after the university ones, and its open questions after the teacher's own questions.
- [[organisationSettings:organisationSurveysTab]] (admins): the programme's own surveys.
- [[organisationSettings:responsiblesTab]]: the programme's teachers and their course counts.
- [[organisationSettings:settingsTab]] (admins):
  - [[organisationSettings:feedbackCorrespondents]]: see below.
  - [[organisationSettings:studentListVisibility]]: whether responsible teachers see who has answered (see Respondents), for all courses or per course.
  - [[organisationSettings:courseSettings]]: [[organisationSettings:feedbackEnabled]] switches feedback on or off per course unit.

### Feedback liaison

The feedback liaison (palautevastaava) gets admin rights to the programme. To add one: [[navBar:myProgrammes]] > the programme > [[organisationSettings:settingsTab]] > [[organisationSettings:newCorrespondent]], search by email or name, then [[organisationSettings:setAsCorrespondent]]. Type at least 5 characters; the person must be university staff and have logged in to Norppa once. Liaisons can also come from an IAM group; removing one of those in Norppa lasts only until their next login, so remove them from the IAM group instead.

### Programme surveys

For feedback outside course surveys, e.g. semester or year feedback. Created by programme admins in [[organisationSettings:organisationSurveysTab]] with [[organisationSurveys:addSurvey]]:

- Name, dates, [[organisationSurveys:responsibleTeachers]] (university staff who can edit it and see all its answers) and the respondents: pasted student numbers or [[organisationSurveys:addCourses]]. Only those students can answer, and the list isn't updated automatically.
- Then write the questions; there are no university or programme level questions. Results are on its [[feedbackTargetView:feedbacksTab]] tab.
- It can be removed while it has no answers.

## When to contact support

Support is norppa@helsinki.fi. Suggest it only when the user can't solve the problem in Norppa or Sisu, e.g.: reopening or changing the dates of a closed survey, a survey for a course type that doesn't get one automatically, a course or student still missing a few days after the Sisu data was fixed, or an error that persists.

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
