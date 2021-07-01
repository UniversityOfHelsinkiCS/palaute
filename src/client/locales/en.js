/* eslint-disable max-len */

export default {
  common: {
    languages: {
      fi: 'Finnish',
      sv: 'Swedish',
      en: 'English',
    },
    validationErrors: {
      required: 'This field is required',
      wrongDate: 'Survey closing date is before opening date',
    },
    unknownError: 'Something went wrong',
    save: 'Save',
    saveSuccess: 'Information has been saved',
    name: 'Name',
    edit: 'Edit',
    show: 'Show',
    feedbackOpenPeriod:
      'Feedback can be given between {{opensAt}} and {{closesAt}}',
    firstName: 'First name',
    lastName: 'Last name',
    username: 'Username',
    studentNumber: 'Student number',
    dirtyFormPrompt:
      'The page has unsaved changes. Are you sure want to leave the page?',
    actions: 'Actions',
    close: 'Close',
    required: 'Required',
    copy: 'Copy',
  },
  userFeedbacks: {
    mainHeading: 'My feedbacks',
    giveFeedbackButton: 'Give feedback',
    modifyFeedbackButton: 'Modify feedback',
    clearFeedbackButton: 'Clear feedback',
    clearConfirmationQuestion: 'Are you sure you want to clear this feedback?',
    yes: 'Yes',
    no: 'No',
    viewFeedbackSummary: 'View feedback summary',
    noFeedback: 'Nothing to see here. Come back later!',
    feedbackClosed: 'Closed',
    waitingForFeedback: 'Waiting',
    feedbackGiven: 'Given',
  },
  feedbackView: {
    submitButton: 'Give feedback',
    successAlert: 'Feedback has been given',
    feedbackInfo:
      'This feedback is anonymous. Fields marked with an asterisk (*) are required',
    feedbackInfoLink: 'Read more, how your information is being used',
    closedInfo:
      'This feedback is currently closed. Feedback can be given between {{opensAt}} and {{closesAt}}',
    privacyInfoTitle: 'How is my information being used?',
    privacyInfoContent:
      'The user information is used to show correct feedback surveys by using enrolment information. Teacher cannot see which student has given a certain feedback.',
    dontKnowOption: 'N/A',
    editSurvey: 'Edit survey',
    translationLanguage: 'Survey preview language',
    cannotSubmitText:
      'You cannot submit because you are not enrolled in this course',
    feedbackClosedError: 'Feedback is closed',
    endedInfo:
      'The feedback period has ended. <2>Take a look at the feedbacks</2>',
  },
  teacherView: {
    mainHeading: 'My teaching',
    showFeedbacks: 'Show feedbacks',
    showSurvey: 'Show survey',
    editSurvey: 'Edit survey',
    copyLink: 'Copy answer form link',
    copyResponseLink: 'Copy link to feedback summary',
    copied: 'Link copied to clipboard',
    showStudentsWithFeedback: 'Show students who have given feedback',
    feedbackCount: '{{count}}/{{totalCount}} feedbacks given',
    giveFeedbackResponse: 'Give feedback summary',
    noCourseRealisations: 'No course realisations',
    noCourses: 'No courses',
    editFeedbackResponse: 'Edit feedback summary',
    feedbackResponseGiven: 'Feedback summary given',
    feedbackResponseMissing: 'Feedback summary missing',
    feedbackOpen: 'Feedback open',
    ongoingCourses: 'Ongoing courses',
    upcomingCourses: 'Upcoming courses',
    endedCourses: 'Ended courses',
    feedbackNotStarted: 'Feedback has not started',
    surveyOpen: 'Feedback period: {{opensAt}}-{{closesAt}}',
  },
  questionEditor: {
    addQuestion: 'Add question',
    likertQuestion: 'Scale of values',
    openQuestion: 'Open question',
    singleChoiceQuestion: 'Single choice question',
    multipleChoiceQuestion: 'Multiple choice question',
    textualContent: 'Textual content',
    moveUp: 'Move up',
    moveDown: 'Move down',
    removeQuestion: 'Remove question',
    options: 'Options',
    option: 'Option',
    addOption: 'Add option',
    removeOption: 'Remove option',
    label: 'Question',
    content: 'Content',
    removeQuestionConfirmation:
      'Are you sure you want to remove this question?',
    removeOptionConfirmation: 'Are you sure you want to remove this option?',
    description: 'Description',
    done: 'Done',
    languageInfo:
      'Your are currently editing the "{{language}}" translation of this question',
    descriptionHelper:
      'Optional description that provides additional information about the question',
    universityQuestion: 'University level question',
    programmeQuestion: 'Programme level question',
  },
  editFeedbackTarget: {
    closesAt: 'Closes at',
    opensAt: 'Opens at',
    hidden: 'Hidden',
    upperLevelQuestionsInfo:
      'Survey already has {{count}} university and programme level questions, but you can add additional questions. You can click the "Show survey preview" button to see what the survey looks like with all the questions',
    showPreview: 'Show survey preview',
    translationLanguage: 'Translation language',
    warningAboutOpeningCourse:
      'WARNING! The survey cannot be edited after the feedback form opens',
    opensAtIsNow:
      'The survey is set to open immediately! When the survey is open it cannot be edited anymore. Are you sure you want to save the survey?',
    noUnsavedChanges: 'You do not have unsaved changes to submit',
  },
  questionResults: {
    answerCount: 'Answer count',
    answerOption: 'Answer option',
    publicInfo:
      'The results from these questions are visible to students. <2>Select public questions</2>',
    notPublicInfo:
      'The results from these questions are not visible to students. <2>Select public questions</2>',
  },
  feedbackSummary: {
    question: 'Question',
    average: 'Average',
    standardDeviation: 'Standard Deviation',
    median: 'Median',
    answers: 'Answers',
  },
  feedbackTargetResults: {
    notEnoughFeedbacksInfo:
      'Survey results will not be displayed because it does not have enough feedbacks',
    onlyForEnrolledInfo:
      'Survey results will not be displayed because the teacher has set feedback visible only for enrolled students',
    studentsWithFeedbackHeading: 'Students who have given feedback',
    responseHeading: "Teacher's feedback summary",
    giveResponse: 'Give feedback summary',
    editResponse: 'Edit feedback summary',
    noResponseInfo: "The course's teacher has not given a feedback summary yet",
    exportCsv: 'Export as csv',
    thankYouMessage:
      'Thank you for the feedback, here is a summary of the feedbacks so far.',
  },
  navBar: {
    myFeedbacks: 'My feedbacks',
    myCourses: 'My teaching',
    logOut: 'Log out',
    admin: 'Admin',
    courseSummary: 'Course summary',
    nameFallback: 'Menu',
  },
  studentsWithFeedback: {
    noFeedbackInfo:
      'No one has given feedback yet or the programme does not show students who have given feedback',
    studentsList: 'Students who have given feedback',
  },
  feedbackResponse: {
    responseLabel: 'Feedback summary',
    responseInfo: 'This field supports <2>Markdown</2> content',
    previewLabel: 'Preview',
    sendEmail: 'Send email notification to students',
  },
  publicQuestions: {
    publicInfo:
      'Feedback related to public questions is visible to students on the <2>feedback page</2> once the feedback period has ended. Note that feedback related to university level Likert scale questions is always visible for students once the feedback period has ended',
    selectVisibility: 'Select who can see the public questions',
    none: 'Only programme personel',
    enrolled: 'Enrolled students',
    everyone: 'Everyone',
  },
  courseSummary: {
    heading: 'Summary of course feedback',
    noResults: 'No feedbacks',
    feedbackResponse: 'Latest course feedback response given',
    feedbackCount: 'Feedback count',
    feedbackResponseGiven: 'Feedback response has been given',
    feedbackResponseNotGiven: 'Feedback response has not been given',
    feedbackStillOpen: 'Feedback for this course is still ongoing',
    courseOngoing: 'The course is still ongoing',
    editProgrammeSettings: "Edit programme's settings",
    courseRealisation: 'Course realisation',
  },
  organisationView: {
    organisations: 'Organisations',
    noOrganisations: 'This user is not a part of any organisations',
    organisationName: 'Name',
    organisationCode: 'Organisation code',
  },
  editProgrammeSurvey: {
    noWriteAccess: `You don't have the rights to edit the programme survey`,
    upperLevelQuestionsInfo: `Survey already has {{count}} university level questions, but you can add additional questions.`,
    bigBoss:
      'Programme survey and settings can be edited by programme personel',
    studentListVisible: 'Student list visible',
    programmeSettings: 'Programme settings',
  },
  footer: {
    contactSupport: 'Contact support',
  },
  courseRealisationFeedback: {
    noFeedbackTarget: 'This course does not have a feedback available to you',
  },
  organisationSettings: {
    surveyInfo:
      "Programme level questions are displayed in every programme's course's surveys after the university level questions. Survey already has {{count}} university level questions, but you can add additional questions",
    studentListVisible:
      "Show course's teacher students who have given feedback",
    courseSettingsInfo: 'Feedback is only collected from activated courses',
    generalTab: 'General settings',
    coursesTab: 'Activated courses',
    surveyTab: 'Programme survey',
  },
  feedbackTargetView: {
    feedbackDisabled: 'This feedback is disabled',
    surveyTab: 'Survey',
    feedbacksTab: 'Feedbacks',
    feedbackResponseTab: 'Feedback summary',
    editSurveyTab: 'Edit survey',
    studentsWithFeedbackTab: 'Respondents',
    linkCopied: 'A link to the feedback has been copied to clipboard',
    copyLink: 'Copy link',
  },
}
