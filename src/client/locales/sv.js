/* eslint-disable max-len */

export default {
  common: {
    languages: {
      fi: 'Finska',
      sv: 'Svenska',
      en: 'Engelska',
    },
    validationErrors: {
      required: 'Fältet krävs',
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
    viewFeedbackSummary: 'Visa sammanfattning av responsen',
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
    feedbackInfoLink: 'Läs mera om hur informationen används',
    closedInfo:
      'Denna respons är för tillfället stängd. Responsen kan ges mellan {{opensAt}} och {{closesAt}}',
    privacyInfoTitle: 'Hur används mina uppgifter?',
    privacyInfoContent:
      'Användaruppgifterna används till exempel för att visa studeranden den rätta förfrågan för respons, för att skicka påminnelsemeddelanden och för att visa läraren vilka studeranden har skickat respons (denna information kan användas till exempel vid bedömning). Läraren kan inte veta vem av studerandena har givit viss repons. Läraren kan se en lista på studeranden som har givit respons efter att reponsen har öppnats, men ser responsen först efter att responsen har stängts. Om antalet responser en kurs har fått är fem eller mindre, syns inte responsen alls',
    dontKnowOption: 'Ingen uppgift',
    editSurvey: 'Redigera förfrågan',
    translationLanguage: 'Språket på förfrågans förhandsvisning',
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
      'Förfrågan har redan {{count}} frågor på universitets- och avdelningsnivå, men du kan lägga till frågor. Du kan trycka på knappen "Visa förfrågans förhandsvisning" för att se hur förfrågan ser ut med alla frågorna',
    showPreview: 'Visa förfrågans förhandsvisning',
    translationLanguage: 'Språkversion',
    warningAboutOpeningCourse:
      'VARNING! Formulärets information kan inte ändras efter att föfrågan har öppnats',
    opensAtIsNow:
      'Förfrågan är inställd att öppnas genast! När förfrågan öppnas kan den inte längre redigeras',
    checkbox: 'Jag förstår',
  },
  questionResults: {
    answerCount: 'Antalet svar',
    answerOption: 'Svarsalternativ',
    publicInfo:
      'Resultaten från dessa frågor är synliga för studerandena. <2>Välj offentligtgjorda frågor</2>',
    notPublicInfo:
      'Resultaten från dessa frågor är inte synliga för studerandena. <2>Välj offentligtgjorda frågor</2>',
  },
  feedbackSummary: {
    question: 'Fråga',
    average: 'Medeltal',
    standardDeviation: 'Standardavvikelse',
    median: 'Median',
    answers: 'Svar',
  },
  feedbackTargetList: {
    showFeedbacks: 'Visa respons',
    showSurvey: 'Visa förfrågan',
    editSurvey: 'Redigera förfrågan',
    copyLink: 'Kopiera svar via länk',
    copied: 'Länk kopierat till urklippet',
    showStudentsWithFeedback: 'Visa studerandena som har givit respons',
    studentFeedbacks: 'responser givna',
    giveFeedbackResponse: 'Ge svar på responsen',
    editFeedbackResponse: 'Redigera svar på responsen',
    noCourseRealisations: 'Kursen arrangeras inte för tillfället',
    selectPublicQuestions: 'Välj offentligtgjorda frågor',
  },
  feedbackTargetResults: {
    notEnoughFeedbacksInfo:
      'Förfrågans resultat visas inte på grund av för få responser',
    studentsWithFeedbackHeading: 'Studeranden som givit respons',
    responseHeading: 'Lärarens svar på responsen',
    giveResponse: 'Ge svar på responsen',
    editResponse: 'Redigera svaret på responsen',
    noResponseInfo:
      "Kursens lärare har inte ännu svarat på responsen",
  },
  navBar: {
    myFeedbacks: 'Mina responser',
    myCourses: 'Mina kurser',
    logOut: 'Logga ut',
    admin: 'Admin',
    nameFallback: 'Menu',
  },
  studentsWithFeedback: {
    noFeedbackInfo: 'Ingen har tillsvidare givit respons',
  },
  feedbackResponse: {
    responseLabel: 'Svar på response',
    responseInfo: 'Fält stöder innehåll med <2>Markdown</2>',
    previewLabel: 'Förhandsvisa',
  },
  publicQuestions: {
    publicInfo:
      'Responsen gällande offentligtgjorda frågor visas för studeranden på <2>responssidan</2> efter att responstiden har tagit slut',
  },
}
