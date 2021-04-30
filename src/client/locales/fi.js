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
    dirtyFormPrompt:
      'Sivulla on tallentamattomia muutoksia. Oletko varma, että haluat siirtyä pois sivulta?',
    actions: 'Toiminnot',
  },
  userFeedbacks: {
    mainHeading: 'Palautteeni',
    giveFeedbackButton: 'Anna palautetta',
    modifyFeedbackButton: 'Muokkaa palautetta',
    clearFeedbackButton: 'Tyhjennä palaute',
    clearConfirmationQuestion: 'Haluatko varmasti tyhjentää tämän palautteen?',
    yes: 'Kyllä',
    no: 'Ei',
    viewFeedbackSummary: 'Näytä palautteen yhteenveto',
    noFeedback: 'Ei vielä nähtävää täällä. Tule takaisin myöhemmin!',
    feedbackClosed: 'Palaute on suljettu',
    waitingForFeedback: 'Odottaa palautetta',
    feedbackGiven: 'Palaute on annettu',
  },
  feedbackView: {
    submitButton: 'Lähetä palaute',
    successAlert: 'Palaute on annettu',
    feedbackInfo:
      'Tämä palaute annetaan anonyymisti. Tähdellä (*) merkityt kentät ovat pakollisia',
    closedInfo:
      'Palaute on tällä hetkellä suljettu. Palautetta voi antaa välillä {{opensAt}} - {{closesAt}}',
  },
  teacherView: {
    noActiveCourses: 'Ei aktiivisia kursseja',
    oldCourses: 'Näytä vanhat kurssit',
    modifyForm: 'Muokkaa lomaketta',
    viewFeedbackSummary: 'Näytä palautteen yhteenveto',
    viewFeedbackTargets: 'Näytä palautteen kohteet',
    sortBy: 'Järjestä',
    courseName: 'Kurssin nimi',
    courseCode: 'Kurssikoodi',
    mainHeading: 'Kurssini',
  },
  questionEditor: {
    addQuestion: 'Lisää kysymys',
    likertQuestion: 'Likert kysymys',
    openQuestion: 'Avoin kysymys',
    singleChoiceQuestion: 'Yhden vaihtoehdon kysymys',
    multipleChoiceQuestion: 'Monen vaihtoehdon kysymys',
    textualContent: 'Tekstuaalinen sisältö',
    moveUp: 'Siirrä ylös',
    moveDown: 'Siirrä alas',
    removeQuestion: 'Poista kysymys',
    options: 'Vaihtoehdot',
    option: 'Vaihtoehto',
    addOption: 'Lisää vaihtoehto',
    removeOption: 'Poista vaihtoehto',
    label: 'Tunniste',
    content: 'Sisältö',
    removeQuestionConfirmation: 'Haluatko varmasti poistaa tämän kysymyksen?',
    removeOptionConfirmation: 'Haluatko varmasti poistaa tämän vaihtoehdon?',
    description: 'Kuvaus',
  },
  editFeedbackTarget: {
    closesAt: 'Sulkeutuu',
    opensAt: 'Avautuu',
    hidden: 'Piilotettu',
    upperLevelQuestionsInfo:
      'Kyselyllä on jo {{count}} yliopisto- ja laitostason kysymystä, mutta voit halutessasi lisätä sille lisää kysmyksiä. "Näytä"-painiketta painamalla näet, miltä kysely näyttää kaikkine kysymyksineen',
  },
  questionResults: {
    answerCount: 'Vastausten määrä',
    answerOption: 'Vastausvaihtoehto',
  },
  feedbackTargetList: {
    showFeedbacks: 'Näytä palautteet',
    showSurvey: 'Näytä kysely',
    editSurvey: 'Muokkaa kyselyä',
    copyLink: 'Kopioi linkki palautteeseen',
    copied: 'Linkki kopioitu leikepöydälle',
    showStudentsWithFeedback: 'Näytä palautetta antaneet opiskelijat',
    studentFeedbacks: 'palautetta annettu',
  },
  feedbackTargetResults: {
    notEnoughFeedbacksInfo:
      'Kyselyn tuloksia ei näytetä, sillä siinä ei ole tarpeeksi palautteita',
    studentsWithFeedbackHeading: 'Opiskelijat, jotka ovat antaneet palautetta',
  },
  navBar: {
    myFeedbacks: 'Palautteeni',
    myCourses: 'Kurssini',
    logOut: 'Kirjaudu ulos',
    admin: 'Ylläpito',
  },
  studentsWithFeedback: {
    noFeedbackInfo: 'Kukaan ei ole antanut palautetta vielä',
  },
}
