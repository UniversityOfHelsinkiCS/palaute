const { Op } = require('sequelize')
const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
} = require('../../models')
const { pate } = require('../pateClient')
const {
  createRecipientsForFeedbackTargets,
  getFeedbackTargetLink,
} = require('./util')

const getOpenFeedbackTargetsForStudents = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lte]: new Date(),
      },
      closesAt: {
        [Op.gte]: new Date(),
      },
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('August 1, 2021 00:00:00') },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        attributes: ['courseCode', 'name'],
        include: [
          {
            model: Organisation,
            as: 'organisations',
            required: true,
            attributes: ['disabledCourseCodes'],
          },
        ],
      },
      {
        model: User,
        as: 'users',
        required: true,
        attributes: [
          'id',
          'username',
          'email',
          'language',
          'degreeStudyRight',
          'secondaryEmail',
        ],
        through: {
          where: {
            accessStatus: 'STUDENT',
          },
        },
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )

    if (!target.isOpen()) return false

    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const buildNotificationAboutSurveyOpeningToStudents = (
  courseNamesAndUrls,
  courseName,
  hasMultipleFeedbackTargets,
) => {
  const translations = {
    text: {
      en: `Dear student, <br/>
          Course feedback for the following courses are now open: <br/>
          ${courseNamesAndUrls}
          Please provide feedback on the course so that we can improve teaching and University operations.
          Once you have completed the form, you will see a summary of your feedback. You will be able to edit your feedback as long
          as the form remains open.`,
      fi: `Hyvä opiskelija!<br/> Seuraavien kurssien kurssipalautelomakkeet ovat nyt auki:<br/>
          ${courseNamesAndUrls}
          Käythän antamassa kurssipalautetta, jotta voimme kehittää opetusta ja yliopiston toimintaa. 
          Vastattuasi näet palautekoosteen ja voit muokata vastauksia kyselyn ollessa auki.`,
      sv: `Bästa studerande! <br/>
          Kursresponsblanketten för följande kurser är nu öppna: <br/>
          ${courseNamesAndUrls}
          Ge gärna kursrespons, så att vi kan utveckla undervisningen och universitetets verksamhet.
          Efter att du gett din respons kan du se ett sammandrag och du kan ändra dina svar så länge kursresponsen är öppen.`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `Course feedback has opened`
        : `Course feedback for course ${courseName} has opened`,
      fi: hasMultipleFeedbackTargets
        ? `Kurssipalaute on avautunut`
        : `Kurssin ${courseName} kurssipalaute on avautunut`,
      sv: hasMultipleFeedbackTargets
        ? `Kursresponsen har öppnats`
        : `Kursresponsen för kursen ${courseName} har öppnats`,
    },
  }

  return translations
}

const notificationAboutSurveyOpeningToStudents = (
  emailAddress,
  studentFeedbackTargets,
) => {
  const { language, name } = studentFeedbackTargets[0]
  const hasMultipleFeedbackTargets = studentFeedbackTargets.length > 1

  const emailLanguage = !language ? 'en' : language

  const courseName = name[emailLanguage]
    ? name[emailLanguage]
    : Object.values(name)[0]

  let courseNamesAndUrls = ''

  for (const feedbackTarget of studentFeedbackTargets) {
    courseNamesAndUrls = `${courseNamesAndUrls}${getFeedbackTargetLink(
      feedbackTarget,
    )}`
  }

  const translations = buildNotificationAboutSurveyOpeningToStudents(
    courseNamesAndUrls,
    courseName,
    hasMultipleFeedbackTargets,
  )

  const email = {
    to: emailAddress,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

const sendEmailAboutSurveyOpeningToStudents = async () => {
  const feedbackTargets = await getOpenFeedbackTargetsForStudents()

  const studentsWithFeedbackTargets = await createRecipientsForFeedbackTargets(
    feedbackTargets,
    { whereOpenEmailNotSent: true },
  )

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(
    (student) =>
      notificationAboutSurveyOpeningToStudents(
        student,
        studentsWithFeedbackTargets[student],
      ),
  )

  const ids = Object.keys(studentsWithFeedbackTargets).flatMap((key) =>
    studentsWithFeedbackTargets[key].map(
      (course) => course.userFeedbackTargetId,
    ),
  )

  UserFeedbackTarget.update(
    {
      feedbackOpenEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    },
  )

  await pate.send(emailsToBeSent, 'Notify students about feedback opening')

  return emailsToBeSent
}

module.exports = {
  getOpenFeedbackTargetsForStudents, // used by stats
  notificationAboutSurveyOpeningToStudents, // used by stats
  sendEmailAboutSurveyOpeningToStudents,
}
