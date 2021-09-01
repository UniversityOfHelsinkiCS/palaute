/* eslint-disable max-len */

export default {
  common: {
    languages: {
      fi: 'Suomi',
      sv: 'Ruotsi',
      en: 'Englanti',
    },
    validationErrors: {
      required: 'Tämä kenttä vaaditaan',
      wrongDate: 'Kysely sulkeutuu ennen sen avautumista',
    },
    unknownError: 'Jotain meni pieleen',
    save: 'Tallenna',
    saveSuccess: 'Tiedot tallennettiin onnistuneesti',
    name: 'Nimi',
    edit: 'Muokkaa',
    show: 'Näytä',
    feedbackOpenPeriod:
      'Palautetta voi antaa aikavälillä {{opensAt}} - {{closesAt}}',
    firstName: 'Etunimi',
    lastName: 'Sukunimi',
    username: 'Käyttäjätunnus',
    studentNumber: 'Opiskelijanumero',
    dirtyFormPrompt:
      'Sivulla on tallentamattomia muutoksia. Oletko varma, että haluat siirtyä pois sivulta?',
    actions: 'Toiminnot',
    close: 'Sulje',
    required: 'Pakollinen',
    copy: 'Kopioi',
  },
  userFeedbacks: {
    mainHeading: 'Kurssipalautteeni',
    giveFeedbackButton: 'Anna palautetta',
    modifyFeedbackButton: 'Muokkaa palautettani',
    clearFeedbackButton: 'Poista palautteeni',
    clearConfirmationQuestion: 'Haluatko varmasti poistaa antamasi palautteen?',
    yes: 'Kyllä',
    no: 'Ei',
    viewFeedbackSummary: 'Näytä palautteen yhteenveto',
    noFeedback: 'Ei vielä nähtävää täällä. Tule takaisin myöhemmin!',
    feedbackClosed: 'Päättyneet',
    waitingForFeedback: 'Odottavat',
    feedbackGiven: 'Annetut',
  },
  feedbackView: {
    submitButton: 'Lähetä palaute',
    editButton: 'Muokkaa palautetta',
    successAlert: 'Palaute on annettu. Kiitos palautteestasi!',
    feedbackInfo:
      'Tämä palaute annetaan anonyymisti. Tähdellä (*) merkityt kentät ovat pakollisia.',
    feedbackInfoLink: 'Lue lisää, miten tietojasi käytetään',
    closedInfo:
      'Palaute on tällä hetkellä suljettu. Palautetta voi antaa välillä {{opensAt}} - {{closesAt}}',
    privacyInfoTitle: 'Miten tietojani käytetään?',
    privacyInfoContent:
      'Kirjautumistietoja käytetään siihen, että opiskelijalle näytetään oikeat palautteet ilmoittautumisten perusteella. Opettaja ei voi yhdistää palautteita yksittäisiin opiskelijoihin.',
    dontKnowOption: 'eos',
    editSurvey: 'Muokkaa kyselyä',
    translationLanguage: 'Kyselyn esikatselun kieli',
    cannotSubmitText:
      'Et voi lähettää palautetta, sillä et ole ilmoittautunut kurssille',
    feedbackClosedError: 'Palautteenanto on sulkeutunut',
    endedInfo: 'Palautteenanto on sulkeutunut. <2>Katso palautteita</2>',
  },
  teacherView: {
    mainHeading: 'Opetukseni',
    showFeedbacks: 'Näytä palautteet',
    showSurvey: 'Näytä kysely',
    editSurvey: 'Muokkaa kyselyä',
    copyLink: 'Kopioi vastauslinkki',
    copyResponseLink: 'Kopioi linkki vastapalautteeseen',
    copied: 'Linkki kopioitu leikepöydälle',
    showStudentsWithFeedback: 'Näytä palautetta antaneet opiskelijat',
    feedbackCount: '{{count}}/{{totalCount}} palautetta annettu',
    giveFeedbackResponse: 'Anna vastapalaute',
    editFeedbackResponse: 'Muokkaa vastapalautetta',
    noCourseRealisations: 'Ei kurssitoteutuksia',
    noCourses: 'Ei kursseja',
    feedbackResponseGiven: 'Vastapalaute annettu',
    feedbackResponseMissing: 'Vastapalaute puuttuu',
    feedbackOpen: 'Palaute käynnissä',
    ongoingCourses: 'Käynnissä olevat kurssit',
    upcomingCourses: 'Tulevat kurssit',
    endedCourses: 'Päättyneet kurssit',
    feedbackNotStarted: 'Palautejakso ei ole vielä alkanut',
    surveyOpen: 'Palautteenantoaika: {{opensAt}}-{{closesAt}}',
  },
  questionEditor: {
    addQuestion: 'Lisää osio tai kysymys',
    likertQuestion: 'Arvoasteikkokysymys',
    openQuestion: 'Avoin kysymys',
    singleChoiceQuestion: 'Monivalintakysymys - valitse yksi',
    multipleChoiceQuestion: 'Monivalintakysymys - valitse monta',
    textualContent: 'Tekstuaalinen sisältö',
    moveUp: 'Siirrä ylös',
    moveDown: 'Siirrä alas',
    removeQuestion: 'Poista kysymys',
    options: 'Vaihtoehdot',
    option: 'Vaihtoehto',
    addOption: 'Lisää vaihtoehto',
    removeOption: 'Poista vaihtoehto',
    label: 'Kysymys',
    content: 'Sisältö',
    removeQuestionConfirmation: 'Haluatko varmasti poistaa tämän kysymyksen?',
    removeOptionConfirmation: 'Haluatko varmasti poistaa tämän vaihtoehdon?',
    description: 'Kuvaus',
    done: 'Valmis',
    languageInfo: 'Muokkaat tällä hetkellä kysymyksen "{{language}}" käännöstä',
    descriptionHelper:
      'Vapaaehtoinen kysymystä kuvaileva tai tarkentava tekstikappale',
    universityQuestion: 'Yliopistotaso',
    programmeQuestion: 'Koulutusohjelmataso',
    uneditableTooltip:
      'Tämä on määritetty etukäteen ja lisätään automaattisesti kyselyyn eikä sitä voi muokata tai poistaa',
    duplicate: 'Duplikoi',
  },
  editFeedbackTarget: {
    closesAt: 'Sulkeutuu',
    opensAt: 'Avautuu',
    hidden: 'Piilotettu',
    upperLevelQuestionsInfo:
      'Kyselyllä on jo {{count}} yliopisto- ja koulutusohjelmatason kysymystä, mutta voit halutessasi lisätä sille lisää kysymyksiä. "Esikatsele kyselyä"-painiketta painamalla näet, miltä kysely näyttää kaikkine kysymyksineen',
    showPreview: 'Esikatsele kyselyä',
    translationLanguage: 'Käännösten kieli',
    warningAboutOpeningCourse:
      'HUOM! Kyselyn tietoja ei voi muokata palautteen avautumisen jälkeen. Palautetteen tulee olla auki vähintään yhden vuorokauden ajan',
    opensAtIsNow:
      'Kysely on asetettu avautumaan heti! Kyselyn ollessa auki sitä ei voi enää muokata. Haluatko varmasti tallentaa kyselyn?',
    checkbox: 'Ymmärrän',
    noUnsavedChanges: 'Ei tallentamattomia muutoksia',
    openImmediately: 'Avaa palautteenanto heti',
    openImmediatelyConfirm:
      'Palautteenannon avauduttua kyselyä ei voi enää muokata, haluatko varmasti avata palautteenannon?',
    copyFromCourseDialogTitle: 'Kopioi kysymyksiä kurssilta',
    copySuccessSnackbar: 'Kysymykset on kopioitu kyselyyn',
    copyQuestionsButton: 'Kopioi kysymykset',
    copyFromCourseButton: 'Kopioi kysymyksiä kurssilta',
    copyFromCourseInfoAlert:
      'Voit kopioida kysymyksiä opettamiltasi kursseilta. Valitse ensin kurssi ja sen jälkeen toteutus, jonka kysymykset haluat kopioida',
    copyFromCourseChooseCourse: 'Valitse kurssi nähdäksesi sen toteutukset',
    copyFromCourseNoQuestions:
      'Millään kurssin toteutuksella ei ole omia kysymyksiä',
    copyFromCourseQuestionCount: '{{count}} kysymystä',
    copyFromCourseSearchLabel: 'Kurssi',
    openFeedbackImmediatelyDialogTitle: 'Varoitus!',
    openFeedbackImmediatelyDialogContent:
      'Olet avaamassa kurssin palautteenantoa heti. Huomioithan, että kun kurssin palautteenanto on auki, et voi enää muokata sen kyselyä tai aukiolopäivämääriä.',
    openFeedbackImmediatelyDialogCancel: 'Peruuta',
    openFeedbackImmediatelyDialogConfirm: 'Avaa palautteenanto heti',
    opensAtInPastError: 'Aloituspäiväämärä ei voi olla menneisyydessä',
    closesAtBeforeOpensAtError:
      'Sulkeutumispäivämäärän tulee olla aloituspäivämäärän jälkeen',
    tooShortFeedbackPeriodError:
      'Palautetteen tulee olla auki vähintään yhden vuorokauden ajan',
  },
  questionResults: {
    answerCount: 'Vastausten määrä',
    answerOption: 'Vastausvaihtoehto',
    publicInfo:
      'Tämän kysymyksen tulokset ovat julkisia opiskelijoille. <2>Valitse julkiset kysymykset</2>',
    notPublicInfo:
      'Tämän kysymyksen tulokset eivät ole julkisia opiskelijoille. <2>Valitse julkiset kysymykset</2>',
  },
  feedbackSummary: {
    question: 'Kysymys',
    average: 'Keskiarvo',
    standardDeviation: 'Keskihajonta',
    median: 'Mediaani',
    answers: 'Vastanneita',
  },
  feedbackTargetResults: {
    notEnoughFeedbacksInfo:
      'Kyselyn tuloksia ei näytetä, sillä siinä ei ole tarpeeksi palautteita',
    onlyForEnrolledInfo:
      'Kyselyn tuloksia ei näytetä, sillä kurssin opettaja on asettanut palautteen näkyväksi vain kurssin osallistujille',
    studentsWithFeedbackHeading: 'Opiskelijat, jotka ovat antaneet palautetta',
    responseHeading: 'Opettajan vastapalaute',
    giveResponse: 'Anna vastapalaute',
    editResponse: 'Muokkaa vastapalautetta',
    noResponseInfo: 'Kurssin opettaja ei ole vielä antanut vastapalautetta',
    exportCsv: 'Lataa CSV',
    thankYouMessage:
      'Kiitos palautteesta, tässä on yhteenveto tähän mennessä annetuista palautteista.',
    closeImmediately: 'Lopeta palautejakso heti',
    closeImmediatelyConfirm:
      'Palautejakson loputtua kurssipalautetta ei voi enää kerätä, haluatko varmasti lopettaa palautejakson heti?',
    closeImmediatelyTomorrowConfirm: `Palautejakso suljetaan {{date}}, jotta se on auki vähintään vuorokauden. Palautejakson loputtua kurssipalautetta ei voi enää kerätä, haluatko varmasti lopettaa palautejakson heti?`,
  },
  navBar: {
    myFeedbacks: 'Kurssipalautteeni',
    myCourses: 'Opetukseni',
    logOut: 'Kirjaudu ulos',
    admin: 'Ylläpito',
    courseSummary: 'Kurssiyhteenveto',
    nameFallback: 'Valikko',
  },
  studentsWithFeedback: {
    noFeedbackInfo:
      'Kukaan ei ole antanut palautetta vielä tai koulutusohjelman palautetta antaneita opiskelijoita ei näytetä',
    studentsList: 'Palautteen antaneet opiskelijat',
  },
  feedbackResponse: {
    responseLabel: 'Vastapalaute',
    responseInfo: 'Tämä kenttä tukee <2>Markdown</2>-sisältöä',
    previewLabel: 'Esikatselu',
    sendEmail: 'Ilmoita opiskelijoille palauteyhteenvedosta sähköpostitse',
  },
  publicQuestions: {
    publicInfo:
      'Valitse mihin kysymyksiin liittyvä palaute julkaistaan opiskelijoille <2>palautesivulla</2> palautejakson päätyttyä. Huomaa, että yliopistotason Likert-asteikon kysymyksiin liittyvä palaute julkaistaan aina opiskelijoille palautejakson päätyttyä',
    selectVisibility: 'Valitse käyttäjät jotka näkevät julkiset kysymykset',
    none: 'Vain koulutusohjelman henkilöstö',
    enrolled: 'Kurssin opiskelijat',
    everyone: 'Kaikki käyttäjät',
  },
  courseSummary: {
    heading: 'Kurssipalautteiden yhteenveto',
    noResults: 'Ei palautteita',
    feedbackResponse: 'Viimeisimmän kurssin vastapalaute annettu',
    feedbackCount: 'Palautteiden määrä',
    feedbackResponseGiven: 'Vastapalaute on annettu',
    feedbackResponseNotGiven: 'Vastapalautetta ei ole annettu',
    feedbackStillOpen: 'Kurssin palautejakso on vielä käynnissä',
    courseOngoing: 'Kurssi on vielä käynnissä',
    editProgrammeSettings: 'Muokkaa koulutusohjelman asetuksia',
    courseRealisation: 'Kurssitoteutus',
  },
  organisationView: {
    organisations: 'Organisaatiot',
    noOrganisation: 'Tämä käyttäjä ei ole minkään organisaation jäsen',
    organisationName: 'Nimi',
    organisationCode: 'Organisaation koodi',
  },
  editProgrammeSurvey: {
    noWriteAccess:
      'Sinulla ei ole oikeuksia muokata tämän koulutusohjelman kyselyä',
    upperLevelQuestionsInfo:
      'Kyselyllä on jo {{count}} yliopistotason kysymystä, mutta voit halutessasi lisätä sille lisää kysymyksiä.',
    bigBoss:
      'Koulutusohjelman kysymyksiä ja asetuksia voi muokata koulutusohjelman henkilökunta.',
    studentListVisible: 'Opiskelijoiden lista näkyvissä',
    programmeSettings: 'Koulutusohjelman asetukset',
  },
  footer: {
    contactSupport: 'Ota yhteyttä tukeen',
  },
  courseRealisationFeedback: {
    noFeedbackTarget:
      'Tällä kurssilla ei ole sinulle saatavilla olevaa palautetta',
  },
  organisationSettings: {
    surveyInfo:
      'Koulutusohjelmatason kysymykset näytetään jokaisessa koulutusohjelman kurssin kyselyssä yliopistotason kysymysten jälkeen. Kyselyllä on jo {{count}} yliopistotason kysymystä, mutta voit halutessasi lisätä sille lisää kysymyksiä.',
    studentListVisible:
      'Näytä palautetta antaneet opiskelijat kurssin opettajalle',
    courseSettingsInfo: 'Palautetta kerätään vain aktivoiduilla kursseilla',
    generalTab: 'Yleiset asetukset',
    coursesTab: 'Aktivoidut kurssit',
    surveyTab: 'Koulutusohjelman kysely',
  },
  feedbackTargetView: {
    feedbackDisabled: 'Tämä palaute ei ole käytössä',
    surveyTab: 'Kysely',
    feedbacksTab: 'Palautteet',
    feedbackResponseTab: 'Vastapalaute',
    editSurveyTab: 'Muokkaa kyselyä',
    studentsWithFeedbackTab: 'Palautteenantajat',
    linkCopied: 'Linkki palautteeseen on kopioitu leikepöydälle',
    copyLink: 'Kopioi linkki palautteeseen',
    editFeedbackTab: 'Muokkaa palautetta',
    coursePeriod: 'Kurssi käynnissä',
    feedbackPeriod: 'Palaute käynnissä',
  },
}
