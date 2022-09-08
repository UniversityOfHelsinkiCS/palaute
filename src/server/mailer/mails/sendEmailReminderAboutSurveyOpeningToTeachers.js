const { addDays, format } = require('date-fns')
const { Op } = require('sequelize')
const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
} = require('../../models')
const { pate } = require('../pate')
const {
  createRecipientsForFeedbackTargets,
  instructionsAndSupport,
} = require('./util')

const getFeedbackTargetsAboutToOpenForTeachers = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lt]: addDays(new Date(), 7),
        [Op.gt]: addDays(new Date(), 6),
      },
      feedbackOpeningReminderEmailSent: false,
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
        attributes: ['id', 'username', 'email', 'language', 'secondaryEmail'],
        through: {
          where: {
            accessStatus: 'TEACHER',
          },
        },
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )
    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const buildReminderAboutSurveyOpeningToTeachers = (
  courseNamesAndUrls,
  courseName,
  hasMultipleFeedbackTargets,
) => {
  const translations = {
    text: {
      en: `Dear teacher! <br/>
          The course feedback form for the following courses will open in a week: <br/>
          ${courseNamesAndUrls}
          Please add your own questions, if any, before the above date. You can add the questions by clicking the course name. Thank you! <br/>
          ${instructionsAndSupport.en}`,
      fi: `Hyvä opettaja! <br/> 
          Kurssipalautelomake seuraaville kursseille aukeaa viikon päästä: <br/>
          ${courseNamesAndUrls}
          Lisääthän mahdolliset omat kysymyksesi ennen palautejakson alkamista. Kysymyksiä voit lisätä klikkaamalla kurssin nimeä. Kiitos!  <br/>
          ${instructionsAndSupport.fi}`,
      sv: `Bästa lärare! <br/>
          Kursresponsblanketten för följande kurser öppnas om en vecka: <br/>
          ${courseNamesAndUrls}
          Du kan lägga till egna frågor innan det. Du kan lägga till frågor med att klicka på kursens namn. Tack! <br/>
          ${instructionsAndSupport.sv}`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `The feedback for your courses are about to start`
        : `Feedback for the course ${courseName} is about to start`,
      fi: hasMultipleFeedbackTargets
        ? `Palautejakso opettamillesi kursseille on alkamassa`
        : `Palautejakso opettamallesi kurssille ${courseName} on alkamassa`,
      sv: hasMultipleFeedbackTargets
        ? `Perioden för kursrespons börjar på dina kurser`
        : `Tidsperioden för kursrespons på kursen ${courseName} börjar`,
    },
  }

  return translations
}

const emailReminderAboutSurveyOpeningToTeachers = (
  emailAddress,
  teacherFeedbackTargets,
) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language
    ? teacherFeedbackTargets[0].language
    : 'en'
  const courseName = teacherFeedbackTargets[0].name[language]

  let courseNamesAndUrls = ''

  // Sort them so they come neatly in order in the email
  teacherFeedbackTargets.sort((a, b) =>
    a.name[language]?.localeCompare(b.name[language]),
  )

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name, opensAt, closesAt } = feedbackTarget
    const humanOpensAtDate = format(new Date(opensAt), 'dd.MM.yyyy')
    const humanClosesAtDate = format(new Date(closesAt), 'dd.MM.yyyy')

    const openFrom = {
      en: `Open from ${humanOpensAtDate} `,
      fi: `Palautejakso auki ${humanOpensAtDate}`,
      sv: `Öppnas ${humanOpensAtDate} och `,
    }

    const closesOn = {
      en: `to ${humanClosesAtDate}`,
      fi: `- ${humanClosesAtDate}`,
      sv: `stängs ${humanClosesAtDate}`,
    }

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/edit`}>
        ${name[language]}
        </a> (${openFrom[language]} ${closesOn[language]}) <br/>`
  }

  const translations = buildReminderAboutSurveyOpeningToTeachers(
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

const sendEmailReminderAboutSurveyOpeningToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsAboutToOpenForTeachers()

  const teachersWithFeedbackTargets = await createRecipientsForFeedbackTargets(
    feedbackTargets,
    { primaryOnly: true },
  )

  const emailsToBeSent = Object.keys(teachersWithFeedbackTargets).map(
    (teacher) =>
      emailReminderAboutSurveyOpeningToTeachers(
        teacher,
        teachersWithFeedbackTargets[teacher],
      ),
  )

  const ids = feedbackTargets.map((target) => target.id)

  FeedbackTarget.update(
    {
      feedbackOpeningReminderEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    },
  )

  await pate.send(emailsToBeSent, 'Remind teachers about feedback opening')

  return emailsToBeSent
}

module.exports = {
  sendEmailReminderAboutSurveyOpeningToTeachers,
}
