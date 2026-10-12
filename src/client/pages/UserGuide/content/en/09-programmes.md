# Degree programmes and faculties

Each degree programme and faculty has its own page in Norppa. There, its staff follow the feedback of its courses, and its admins add questions to all its course surveys, run programme surveys and choose its settings.

## The programme's page {#programme-page}

Open [[navBar:myProgrammes]] in the top menu (called [[navBar:myOrganisations]] if you also have rights to something other than degree programmes) and choose the programme or faculty. If the menu item is missing, you have no rights to any programme; see [Rights in a degree programme or faculty](/guide/roles#organisation-rights).

The page's tabs depend on your rights. With read rights you see:

- [[organisationSettings:summaryTab]]: the programme's [course summary](/guide/course-summary), with the averages of the programme's own scale questions too.
- [[organisationSettings:courseRealisationsTab]]: the programme's course realisations of the chosen period, with their course and feedback periods, answer counts and responsible teachers. Choose a course to open its survey.
- [[organisationSettings:responsiblesTab]]: the programme's teachers and how many courses each had in the chosen period, downloadable with [[common:exportXLSX]].

Admins, i.e. the programme director, others with admin rights from the IAM groups and the programme's feedback liaisons, also see:

- [[organisationSettings:settingsTab]]: feedback liaisons, who sees the respondents, and which courses collect feedback.
- [[organisationSettings:openQuestionsTab]]: the answers to the open questions of all the programme's courses.
- [[organisationSettings:surveyTab]] (on a faculty's page [[organisationSettings:surveyFacultyTab]]): questions added to all the programme's course surveys.
- [[organisationSettings:organisationSurveysTab]] (on a faculty's page [[organisationSettings:organisationFacultySurveysTab]]): the programme's own surveys. See [Programme surveys](/guide/programme-surveys).

Admins see all answers of the programme's courses; read rights show only the answers to public questions.

## Programme questions {#programme-questions}

Programme questions are added to the course surveys of all the course units that belong to the programme in Sisu, after the university level questions. Teachers see them in their survey but can't edit or remove them.

1. On the programme's page, open the [[organisationSettings:surveyTab]] tab. The university level questions are at the top; they can't be changed here.
2. Click [[questionEditor:addQuestion]] and choose the question type, or [[questionEditor:addTextualContent]] for a text section.
3. Write the question in Finnish, Swedish and English, and click [[questionEditor:done]].
4. The first time you save, Norppa reminds you that the questions are shared by the whole programme. Confirm.

The questions work like a teacher's own questions; see [Editing the questions](/guide/questions#edit-questions).

The change shows at once in every course survey of the programme, _also in surveys that are already open or have closed_. Changing a question's wording changes it in surveys that already have answers to it, and removing a question removes it from them. So add programme questions before the semester's surveys open, and add a new question rather than change the meaning of an old one.

In the survey, students see the programme's scale and choice questions right after the university level ones, and its open questions after the teacher's own questions, before the university level open questions.

### Making the answers public {#programme-questions-public}

A new programme question is [[common:notPublic]]: only the course's responsible teachers and the programme's admins see its answers. To show the answers of a scale or choice question to the course's students and teachers as well:

1. Reload the page after saving the question.
2. Click the question's [[common:notPublic]] button.
3. Choose [[common:publicInfo]].

When the programme has made a question public, it's public on every course of the programme, and teachers can't change that. Answers to open programme questions can't be made public here; a responsible teacher can make them public on their own course after it has closed. See [Public answers](/guide/results#public-answers).

## Adding a feedback liaison {#feedback-liaison}

A feedback liaison gets admin rights to the programme in Norppa: they see all answers of its courses and can do everything described on this page. The programme's admins add liaisons:

1. On the programme's page, open the [[organisationSettings:settingsTab]] tab.
2. Under [[organisationSettings:newCorrespondent]], type at least five characters of the person's email address or name.
3. Click [[organisationSettings:setAsCorrespondent]] next to the right person and confirm.

Only university staff can be found. If someone isn't found, ask them to log in to Norppa once and try again.

The [[organisationSettings:feedbackCorrespondents]] list shows each liaison and how they were added. [[organisationSettings:remove]] removes one. A liaison marked [[organisationSettings:addedInNorppa]] was added on this page. One marked [[organisationSettings:basedOnIam]] comes from an IAM group: removing them in Norppa lasts only until they log in again, so ask for them to be removed from the IAM group instead.

## Settings {#settings}

The [[organisationSettings:settingsTab]] tab (admins only) has the feedback liaisons, [[organisationSettings:generalSettings]] and [[organisationSettings:courseSettings]]. Every change is saved at once.

### Who sees the respondents {#student-list}

On a survey's [[feedbackTargetView:studentsWithFeedbackTab]] tab, the course's responsible teachers see the list of its students. Under [[organisationSettings:studentListVisibility]] you choose whether the list also shows _who has answered_:

- [[organisationSettings:studentListVisible]]: shown on all the programme's courses.
- [[organisationSettings:studentListHidden]]: shown on none of them.
- [[organisationSettings:studentListByCourse]]: a [[organisationSettings:courseStudentListVisible]] switch appears for each course unit under [[organisationSettings:courseSettings]]. Turn it on for the courses where it's shown.

Even when it's allowed, it's shown only after the survey has closed and only if at least five students answered. Nobody can see which answers a student gave. See [Who has answered](/guide/results#who-answered).

### Switching feedback off for a course {#disable-feedback}

Under [[organisationSettings:courseSettings]], each course unit of the programme has a [[organisationSettings:feedbackEnabled]] switch. Find the course with [[organisationSettings:findByCourseUnit]] and turn the switch off, e.g. for a course whose feedback is collected some other way.

The switch applies to all realisations of the course unit. Its teachers then see [[teacherView:disabledCourseWarning]] in [[navBar:myCourses]] and [[feedbackTargetView:feedbackDisabled]] on the course page. Students can't open the survey, and Norppa sends no emails about it. Turn the switch back on to collect feedback again.

## Open questions {#open-questions}

The [[organisationSettings:openQuestionsTab]] tab (admins only) collects in one place the answers to the university level and programme open questions of all the programme's courses, grouped by course and realisation. The teachers' own questions aren't included.

- Choose [[courseSummary:all]] for every year, or [[courseSummary:filter]] to choose an academic year, semester or period. A realisation is shown if its course dates overlap the chosen time.
- Click a course or realisation to open its summary or its answers.
- Very short answers, under five characters, are left out.
- [[feedbackTargetResults:export]] > [[common:exportPdf]] prints the answers or saves them as a PDF.
