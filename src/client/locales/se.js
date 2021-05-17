/* eslint-disable max-len */

export default {
  common: {
    languages: {
      fi: 'Suomi',
      sv: 'Svenska',
      en: 'English',
    },
    validationErrors: {
      required: 'Fältet krävs.',
      wrongDate: 'Förfrågans slutdatum är före startdatumet',
    },
    unknownError: 'Något gick fel',
    save: 'Spara',
    saveSuccess: 'Informationen har sparats',
    name: 'Namn',
    edit: 'Redigera',
    show: 'Visa',
    feedbackOpenPeriod:
      'Respons kan ges mellan {{opensAt}} och {{closesAt}}',
    firstName: 'Förnamn',
    lastName: 'Efternamn',
    username: 'Användarnamn',
    studentNumber: 'Studentnummer',
    dirtyFormPrompt:
      'Sidan har osparade ändringar. Är du säker att du vill lämna sidan?',
    actions: 'Handlingar',
    close: 'Stäng',
    required: 'Krävs',
  },
  userFeedbacks: {
    mainHeading: 'Mina responser',
    giveFeedbackButton: 'Ge respons',
    modifyFeedbackButton: 'Redigera responsen',
    clearFeedbackButton: 'Töm responsen',
    clearConfirmationQuestion: 'Är du säker på att du vill tömma denna respons?',
    yes: 'Ja',
    no: 'Nej',
    viewFeedbackSummary: 'Visa sammanfattning av reponsen',
    noFeedback: 'Ingenting här. Kom tillbaka senare!',
    feedbackClosed: 'Responsen är stängd',
    waitingForFeedback: 'Väntar på respons',
    feedbackGiven: 'Responsen är given',
  },
  feedbackView: {
    submitButton: 'Ge respons',
    successAlert: 'Responsen är given',
    feedbackInfo:
      'Denna respons är anonym. Fälten märkta med en asterisk (*) krävs',
    feedbackInfoLink: 'Läs mera om hur din information används',
    closedInfo:
      'Denna repons är för tillfället stängd. Responsen kan ges mellan {{opensAt}} och {{closesAt}}',
    privacyInfoTitle: 'Hur används min information?',
    privacyInfoContent:
      'Användaruppgifterna anvädns till exempel för att visa studeranden den rätta responsförfrågan, för att skicka påminnelsemeddelanden och för att visa läraren vilka studeranden har skickat repons (denna information kan användas till exempel vid bedömning). Läraren kan inte veta vem av studerandena har givit viss repons. Läraren kan se en lista på studeranden som har givit respons efter att reponsen har öppnats, men ser responsen först efter att responsen har stängts. Om en kurs har fått fem eller mindre gånger respons, syns inte responsen alls',
    dontKnowOption: 'Ingen uppgift',
    editSurvey: 'Redigera förfrågan',
    translationLanguage: 'Språk på förfrågans förhandsvisning',
  },
  teacherView: {
    noActiveCourses: 'Inga aktiva kurser',
    oldCourses: 'Visa gamla kurser',
    modifyForm: 'Redigera formuläret',
    viewFeedbackSummary: 'Visa sammanfattning av responsen',
    viewFeedbackTargets: 'Visa responsens mål',
    sortBy: 'Sortera genom',
    courseName: 'Kursens namn',
    courseCode: 'Kursens kod',
    mainHeading: 'Mina kurser',
  },
  questionEditor: {
    addQuestion: 'Lägg till fråga',
    likertQuestion: 'Värderingsskala',
    openQuestion: 'Öppen fråga',
    singleChoiceQuestion: 'Envalsfråga',
    multipleChoiceQuestion: 'Flervalsfråga',
    textualContent: 'Textinnehåll',
    moveUp: 'Rör dig uppåt',
    moveDown: 'Rör dig nedåt',
    removeQuestion: 'Radera frågan',
    options: 'Alternativ',
    option: 'Alternativ',
    addOption: 'Lägg till alternativ',
    removeOption: 'Radera alternativ',
    label: 'Fråga',
    content: 'Innehåll',
    removeQuestionConfirmation:
      'Är du säker, att du vill radera frågan?',
    removeOptionConfirmation: 'Är du säker, att du vill radera alternativet?',
    description: 'Beskrivning',
    done: 'Färdigt',
    languageInfo:
      'Då håller för tillfället på att redigera språkversionen "{{language}}" av frågan',
    descriptionHelper:
      'Frivillig beskrivning som förser frågan med tilläggsinformation',
  },
  editFeedbackTarget: {
    closesAt: 'Stängs',
    opensAt: 'Öppnas',
    hidden: 'Gömd',
    upperLevelQuestionsInfo:
      'Survey already has {{count}} university and department level questions, but you can add additional questions. You can click the "Show survey preview" button to see what the survey looks like with all the questions',
    showPreview: 'Show survey preview',
    translationLanguage: 'Translation language',
    warningAboutOpeningCourse:
      'WARNING! The form data cannot be edited after the feedback form opens',
    opensAtIsNow:
      'The survey is set to open immediately! When the survey is open it cannot be edited anymore',
    checkbox: 'I understand',
  },
  questionResults: {
    answerCount: 'Answer count',
    answerOption: 'Answer option',
    publicInfo:
      'The results from this questions are visible to students. <2>Select public questions</2>',
    notPublicInfo:
      'The results from this questions are not visible to students. <2>Select public questions</2>',
  },
  feedbackSummary: {
    question: 'Question',
    average: 'Average',
    standardDeviation: 'Standard Deviation',
    median: 'Median',
    answers: 'Answers',
  },
  feedbackTargetList: {
    showFeedbacks: 'Show feedbacks',
    showSurvey: 'Show survey',
    editSurvey: 'Edit survey',
    copyLink: 'Copy answer form link',
    copied: 'Link copied to cliboard',
    showStudentsWithFeedback: 'Show students who have given feedback',
    studentFeedbacks: 'feedbacks given',
    giveFeedbackResponse: 'Give feedback response',
    noCourseRealisations: `This course doesn't have any relevant course realisations`,
    selectPublicQuestions: 'Select public questions',
  },
  feedbackTargetResults: {
    notEnoughFeedbacksInfo:
      'Survey results will not be displayed because it does not have enough feedbacks',
    studentsWithFeedbackHeading: 'Students who have given feedback',
    responseHeading: "Teacher's feedback response",
    giveResponse: 'Give feedback response',
    editResponse: 'Edit feedback response',
    noResponseInfo:
      "The course's teacher has not given a feedback response yet",
  },
  navBar: {
    myFeedbacks: 'My feedbacks',
    myCourses: 'My courses',
    logOut: 'Log out',
    admin: 'Admin',
    nameFallback: 'Menu',
  },
  studentsWithFeedback: {
    noFeedbackInfo: 'No one has given feedback yet',
  },
  feedbackResponse: {
    responseLabel: 'Feedback response',
    responseInfo: 'This field supports <2>Markdown</2> content',
    previewLabel: 'Preview',
  },
  publicQuestions: {
    publicInfo:
      'Feedback related to public questions is visible to students on the <2>feedback page</2> once the feedback period has ended',
  },
}
