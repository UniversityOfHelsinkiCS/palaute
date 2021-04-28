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
    feedbackClosed: 'Feedback is closed',
    waitingForFeedback: 'Waiting for feedback',
    feedbackGiven: 'Feedback has been given',
  },
  feedbackView: {
    submitButton: 'Give feedback',
    successAlert: 'Feedback has been given',
    requiredInfo: 'Fields marked with an asterisk (*) are required',
    closedInfo:
      'This feedback is currently closed. Feedback can be given between {{closesAt}} and {{opensAt}}',
  },
  teacherView: {
    noActiveCourses: 'No courses active',
    oldCourses: 'Show old courses',
    modifyForm: 'Modify form',
    viewFeedbackSummary: 'View feedback summary',
    viewFeedbackTargets: 'View feedback targets',
    sortBy: 'Sort by',
    courseName: 'Course name',
    courseCode: 'Course code',
    mainHeading: 'My courses',
  },
  questionEditor: {
    addQuestion: 'Add question',
    likertQuestion: 'Likert question',
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
    label: 'Label',
    content: 'Content',
    removeQuestionConfirmation:
      'Are you sure you want to remove this question?',
    removeOptionConfirmation: 'Are you sure you want to remove this option?',
    description: 'Description',
  },
  editFeedbackTarget: {
    closesAt: 'Closes at',
    opensAt: 'Opens at',
    hidden: 'Hidden',
    upperLevelQuestionsInfo:
      'Survey already has {{count}} university and department level questions, but you can add additional questions. You can click the "Show" button to see what the survey looks like with all the questions',
  },
  questionResults: {
    answerCount: 'Answer count',
    answerOption: 'Answer option',
  },
  feedbackTargetList: {
    showFeedbacks: 'Show feedbacks',
    showSurvey: 'Show survey',
    editSurvey: 'Edit survey',
    copyLink: 'Copy link to feedback',
    copied: 'Link copied to cliboard',
  },
  feedbackTargetResults: {
    notEnoughFeedbacksInfo:
      'Survey results will not be displayed because it does not have enough feedbacks',
    studentsWithFeedbackHeading: 'Students who have given feedback',
    notVisibleToStudentsInfo:
      'This information will not be visible to students',
    noStudentsWithFeedback: 'No one has given feedback yet',
  },
  navBar: {
    myFeedbacks: 'My feedbacks',
    myCourses: 'My courses',
    logOut: 'Log out',
    admin: 'Admin',
  },
}
