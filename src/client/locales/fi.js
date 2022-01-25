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
    choiceQuestionError: 'Valintakysymykset tarvitsevat vastausvaihtoehtoja',
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
    noFeedback: 'Täällä ei ole vielä yhtään kurssia tai kurssipalautetta',
    feedbackClosedTab: 'Päättyneet',
    waitingForFeedbackTab: 'Odottaa',
    feedbackGivenTab: 'Annetut',
    feedbackGivenChip: 'Palaute on annettu',
    waitingForFeedbackChip: 'Palaute puuttuu',
    feedbackNotStartedChip: 'Palaute ei ole alkanut',
    feedbackEndedChip: 'Palaute on päättynyt',
  },
  feedbackView: {
    submitButton: 'Lähetä palaute',
    editButton: 'Muokkaa palautetta',
    successAlert: 'Palaute on annettu. Kiitos palautteestasi!',
    feedbackInfo:
      'Tämä palaute annetaan anonyymisti. Tähdellä (*) merkityt kentät ovat pakollisia.',
    feedbackInfoLink: 'Lue lisää, miten vastauksiasi ja tietojasi käytetään',
    closedInfo:
      'Palaute on tällä hetkellä suljettu. Palautetta voi antaa välillä {{opensAt}} - {{closesAt}}',
    feedbackInfoTitle: 'Miten vastauksiani ja tietojani käytetään?',
    feedbackInfoContent:
      'Vastauksia kurssipalautteeseen käytetään kurssien sisällön ja opetuksen kehittämiseen. Vastauksia kurssipalautteen kysymyksiin saatetaan näyttää muille kurssin opiskelijoille. Vastauksia käsitellään ja ne näytetään aina anonyymisti, opettaja ei voi yhdistää palautteita yksittäisiin opiskelijoihin. \n Kirjautumistietoja käytetään siihen, että opiskelijalla näytetään oikeat palautteet.',
    dataProtectionNotice: 'Tietosuojaseloste',
    dontKnowOption: 'eos',
    editSurvey: 'Muokkaa kyselyä',
    translationLanguage: 'Kyselyn esikatselun kieli',
    cannotSubmitText:
      'Et voi lähettää palautetta, sillä et ole ilmoittautunut kurssille tai ilmoittautumisesi ei ole vielä päivittynyt järjestelmäämme. Ilmoittautumiset päivittyvät 24 tunnin välein.',
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
    done: 'Tallenna',
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
    upperLevelQuestionsInfoOne:
      'Kyselyllä on jo {{count}} yliopisto- ja koulutusohjelmatason ({{primaryOrganisation}}) kysymystä, mutta voit halutessasi lisätä sille lisää kysymyksiä. "Esikatsele kyselyä"-painiketta painamalle näet, miltä kysely näyttää kaikkine kysymyksineen.',
    upperLevelQuestionsInfoMany:
      'Kyselyllä on jo {{count}} yliopisto- ja koulutusohjelmatason kysymystä, mutta voit halutessasi lisätä sille lisää kysymyksiä. "Esikatsele kyselyä"-painiketta painamalle näet, miltä kysely näyttää kaikkine kysymyksineen.\n Koulutusohjelmatason kysymykset tulevat vastuuorganisaatioilta, jotka ovat {{organisations}}.',
    showPreview: 'Esikatsele kyselyä',
    showPreviewConfirmation:
      'Haluatko varmasti esikatsella? Tallentamattomat muutokset menetetään.',
    translationLanguage: 'Käännösten kieli',
    warningAboutOpeningCourse:
      'HUOM! Kyselyn tietoja ei voi muokata palautteen avautumisen jälkeen. Palautteen tulee olla auki vähintään yhden vuorokauden ajan',
    noUnsavedChanges: 'Ei tallentamattomia muutoksia',
    openImmediately: 'Avaa palaute heti',
    copyFromCourseDialogTitle: 'Kopioi kysymykset toiselta kurssilta',
    copySuccessSnackbar: 'Kysymykset on kopioitu kyselyyn',
    copyQuestionsButton: 'Kopioi kysymykset',
    copyFromCourseButton: 'Kopioi kysymykset toiselta kurssilta',
    copyFromCourseInfoAlert:
      'Voit kopioida kysymyksiä opettamiltasi kursseilta. Valitse ensin kurssi ja sen jälkeen toteutus, jonka kysymykset haluat kopioida',
    copyFromCourseChooseCourse: 'Valitse kurssi nähdäksesi sen toteutukset',
    copyFromCourseNoQuestions:
      'Millään kurssin toteutuksella ei ole omia kysymyksiä',
    copyFromCourseQuestionCount: '{{count}} kysymystä',
    copyFromCourseSearchLabel: 'Kurssi',
    openFeedbackImmediatelyDialogTitle: 'Varoitus!',
    openFeedbackImmediatelyDialogContent:
      'Olet avaamassa kurssin palautetta. Huomioithan, että kurssin palautteen auettua et voi enää muokata sen kyselyä tai aukiolopäivämääriä.',
    openFeedbackImmediatelyDialogCancel: 'Peruuta',
    openFeedbackImmediatelyDialogConfirm: 'Avaa palaute',
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
    publicityOfQuestions:
      'Nämä kysymykset ovat näkyvissä vain kurssin opettajalle',
    moreInfo: 'Lisää tietoa kysymysten näkyvyydestä löytyy',
    here: 'täältä',
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
    export: 'Lataa palaute',
    exportCsv: 'Lataa palaute CSV-tiedostona',
    exportPdf: 'Lataa palaute PDF-tiedostona',
    thankYouMessage:
      'Kiitos palautteesta, tässä on yhteenveto tähän mennessä annetuista palautteista.',
    closeImmediately: 'Sulje palaute heti',
    closeImmediatelyConfirm:
      'Palautejakson loputtua kurssipalautetta ei voi enää kerätä, haluatko varmasti lopettaa palautejakson heti?',
    closeImmediatelyTomorrowConfirm: `Palautejakso suljetaan {{date}}, jotta se on auki vähintään vuorokauden. Palautejakson loputtua kurssipalautetta ei voi enää kerätä, haluatko varmasti lopettaa palautejakson heti?`,
    sendReminder: 'Lähetä muistutusviesti',
    sendReminderButton: 'Lähetä muistutus',
    cancelReminder: 'Peruuta',
    modalTitle: 'Lähetä muistutus palautteesta sähköpostilla',
    writeAMessage: 'Kirjoita viesti opiskelijoille',
    emailMessage:
      'Hyvä opiskelija! \n Vastaathan kurssin {{courseName}} palautteeseen. Palautejakso päättyy {{closesAt}}. \n << Kirjoittamasi viesti tulee tähän >>',
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
      'Palautetta antaiden opiskelijoiden listaa ei voida näyttää. Joko palautetta antaneita opiskelijoita on alle viisi, tai palautetta antaneiden opiskelijoiden lista on poissa käytöstä koulutusohjelman asetuksissa',
    studentsList: 'Palautteen antaneet opiskelijat',
  },
  feedbackResponse: {
    responseLabel: 'Vastapalaute',
    responseInfo: 'Tämä kenttä tukee <2>Markdown</2>-sisältöä',
    previewLabel: 'Esikatselu',
    sendEmail:
      'Tallenna vastapalaute ja ilmoita opiskelijoille vastapalautteesta sähköpostitse',
    instructionTitle: 'Ohjeita vastapalautteen kirjoittamiseen',
    responseInstruction:
      'Käytyään läpi opiskelijoilta saamansa kurssipalautteen, opettajalla on mahdollisuus lähettää opiskelijoille yksi kurssipalautteita kokoavasti kommentoiva vastaus. Tämä vastapalaute on vapaamuotoinen ja lähetetään kerralla kaikille kurssin opiskelijoille. \n Vastapalautteesi opiskelijoille on keskeistä hyvän palautekulttuurin luomiseen: se näyttää opiskelijoille, että heidän palautteensa on oikeasti luettu ja huomioitu. Tämä kannustaa heitä antamaan rakentavaa palautetta tulevaisuudessakin.',
    writingInstruction:
      'Opettajan vastauksen pituus voi vaihdella. Asioita joita voit esimerkiksi sisällyttää vastaukseesi on: opiskelijoiden kiittäminen annetusta palautteesta (ja kurssille osallistumisesta), läpikatsaus annetusta palautteesta, valinta palautteen osa-alueista joihin koet olevan tärkeää vastata sekä reaktiosi ja selvennyksesi niihin. Vastauksessa olevat konkreettiset toimet opetuksen ja kurssien sisällön muokkaukseen vastineena opiskelijoiden palautteeseen ovat ensiarvoisen tärkeitä.',
    dialogTitle: 'Tallenna vastapalaute',
    dialogContent:
      'Tallentaessasi vastapalautteen opiskelijoille lähtee sähköpostiviesti, jossa on vastapalautteen sisältö ja linkki kurssin palautteisiin. Tallennettuasi vastapalautteen et voi enää muokata sitä.',
    dialogCancel: 'Peruuta',
    dialogSubmit: 'Tallenna',
    formDisabled: 'Vastapalautetta voi antaa vasta palautejakson päätyttyä',
  },
  publicQuestions: {
    publicInfo:
      'Valitse mihin kysymyksiin liittyvä palaute julkaistaan opiskelijoille <2>palautesivulla</2>. Huomaa, että yliopistotason Likert-asteikon kysymyksiin liittyvä palaute julkaistaan aina opiskelijoille',
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
    searchLabel: 'Rajaa kursseja',
    searchPlaceholder: 'Rajaa kursseja kurssikoodilla',
    responsibleTeachers: 'Vastuuopettajat',
    includeOpenUniCourses: 'Sisällytä avoimen yliopiston kurssit',
    orderByLabel: 'Järjestys',
    orderByCodeAsc: 'Koodi nousevasti',
    orderByFeedbackCountAsc: 'Palautteiden määrä nousevasti',
    orderByFeedbackCountDesc: 'Palautteiden määrä laskevasti',
  },
  footer: {
    contactSupport: 'Ota yhteyttä tukeen',
    wikiLink: 'Käyttöohje',
    accessibilityDocument: 'Saavutettavuusseloste',
  },
  courseRealisationFeedback: {
    noFeedbackTarget:
      'Tällä kurssilla ei ole sinulle saatavilla olevaa palautetta',
  },
  organisationSettings: {
    surveyInfo:
      'Koulutusohjelmatason kysymykset näytetään jokaisessa koulutusohjelman kurssin kyselyssä yliopistotason kysymysten jälkeen. Kyselyllä on jo {{count}} yliopistotason kysymystä, mutta voit halutessasi lisätä sille lisää kysymyksiä.',
    studentListVisible:
      'Näytä palautetta antaneet opiskelijat kurssin opettajalle, jos palautetta antaneita opiskelijoita on vähintään viisi',
    courseSettingsInfo: 'Palautetta kerätään vain aktivoiduilla kursseilla',
    generalTab: 'Yleiset asetukset',
    coursesTab: 'Aktivoidut kurssit',
    surveyTab: 'Koulutusohjelman kysely',
    summaryTab: 'Yhteenveto',
    editProgrammeQuestionsDialogTitle: 'Varoitus!',
    editProgrammeQuestionsDialogContent:
      'Olet muokkaamassa koko koulutusohjelman yhteisiä kysymyksiä. Nämä muutokset näkyvät kaikilla koulutusohjelman kursseilla. Oletko varma, että haluat muokata näitä kysymyksiä?',
    editProgrammeQuestionsDialogCancel: 'Peruuta',
    editProgrammeQuestionsDialogConfirm: 'Muokkaa',
  },
  feedbackTargetView: {
    feedbackDisabled: 'Tämä palaute ei ole käytössä',
    surveyTab: 'Kysely',
    feedbacksTab: 'Palautteet',
    feedbackResponseTab: 'Vastapalaute',
    editSurveyTab: 'Muokkaa kyselyä',
    studentsWithFeedbackTab: 'Palautteenantajat',
    linkCopied: 'Linkki palautteeseen on kopioitu leikepöydälle',
    copyLink: 'Kopioi opiskelijan vastauslinkki',
    editFeedbackTab: 'Muokkaa palautetta',
    coursePeriod: 'Kurssi käynnissä',
    feedbackPeriod: 'Palaute käynnissä',
    coursePage: 'Kurssisivu',
    responsibleTeachers: 'Vastuuopettajat',
    QR: 'QR-koodi',
  },
  noadUser: {
    noUser:
      'Jotain meni pieleen, et ole tällä hektellä kirjatunut. Kokeile sähköpostin linkkiä uudestaan tai ota yhteys kurssin opettajaan',
    noFeedback:
      'Tällä hetkellä ei ole kurssipalautteita joiden palautejakso olisi käynnissä',
  },
}
