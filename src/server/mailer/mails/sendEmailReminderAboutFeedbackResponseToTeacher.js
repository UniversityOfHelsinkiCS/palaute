/* eslint-disable max-len */
const { subDays } = require('date-fns')
const { Op } = require('sequelize')
const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
  UserFeedbackTarget,
} = require('../../models')
const { pate } = require('../pate')
const { instructionsAndSupport } = require('./util')

const getFeedbackTargetsWithoutResponseForTeachers = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      closesAt: {
        [Op.lt]: new Date(),
        [Op.gt]: subDays(new Date(), 3),
      },
      hidden: false,
      feedbackType: 'courseRealisation',
      feedbackResponse: null,
      feedbackResponseReminderEmailSent: false,
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
          'secondaryEmail',
          'firstName',
          'lastName',
        ],
        through: {
          where: {
            accessStatus: 'TEACHER',
          },
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        attributes: ['id', 'feedback_id'],
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )
    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  const filteredByFeedbacks = filteredFeedbackTargets.filter((target) => {
    const found = target.userFeedbackTargets.find(
      (u) => u.dataValues.feedback_id,
    )
    return !!found
  })

  return filteredByFeedbacks
}

const buildReminderAboutFeedbackResponseToTeachers = (
  courseNamesAndUrls,
  courseName,
  receivedBy,
) => {
  const teachers = receivedBy
    ?.map((u) => `${u.firstName} ${u.lastName}`)
    ?.join(', ')
  const translations = {
    text: {
      en: `Dear teacher! <br/>
          The feedback period for the course has ended: <br/>
          ${courseNamesAndUrls}
          Please give counter feedback for the students. You can give counter feedback by clicking the course name. <br/>
          Your response to students is central for creating a feedback culture: it shows students that their feedback is actually read and used, which encourages them to give constructive feedback in the future. Counter feedback is sent to all students of the course. <br/>
          Thank you! <br/>
          ${instructionsAndSupport.en} <br/>
          ${teachers ? `Reminder sent to ${teachers}` : ''}`,
      fi: `Hyvä opettaja! <br/> 
          Palautejakso kurssille on päättynyt: <br/>
          ${courseNamesAndUrls}
          Annathan opiskelijoille vastapalautetta. Vastapalautetta voit antaa klikkaamalla kurssin nimeä.  <br/>
          Vastapalautteesi opiskelijoille on keskeistä hyvän palautekulttuurin luomiseen: se näyttää opiskelijoille, että heidän palautteensa on oikeasti luettu ja huomioitu. Tämä kannustaa heitä antamaan rakentavaa palautetta tulevaisuudessakin. Vastapalaute lähetetään kaikille kurssin opiskelijoille. <br/>
          Kiitos!  <br/>
          ${instructionsAndSupport.fi} <br/>
          ${teachers ? `Muistutus lähetetty opettajille ${teachers}` : ''}`,
      sv: `Bästa lärare! <br/>
          Responsperioden för följande kurser har tagit slut: <br/>
          ${courseNamesAndUrls}
          Ge gärna studerandena respons tillbaka. Du kan ge motrespons genom att klicka på kursens namn. <br/>
          Ditt svar till studerandena är centralt i skapandet av en bra responskultur: det visar studerandena att deras respons faktiskt läses och beaktas. Det här uppmuntrar dem att ge konstruktiv feedback i framtiden. Responsen kommer att skickas till alla studenter i kursen. <br/>
          Tack! <br/>
          ${instructionsAndSupport.sv} <br/>
          ${teachers ? `Påminnelse skickad till ${teachers}` : ''}`,
    },
    subject: {
      en: `Please give counter feedback for the course ${courseName}`,
      fi: `Annathan vastapalautetta kurssillesi ${courseName}`,
      sv: `Ge gärna motrespons för kursen ${courseName}`,
    },
  }

  return translations
}

const emailReminderAboutFeedbackResponseToTeachers = (
  teacher,
  feedbackTarget,
  allTeachers,
) => {
  const { language } = teacher
  const courseName = feedbackTarget.courseUnit?.name[language || 'en']

  const courseNamesAndUrls = `<a href=${`https://coursefeedback.helsinki.fi/targets/${feedbackTarget.id}/feedback-response`}>
      ${feedbackTarget.courseRealisation.name[language]}
      </a> <br/>`

  const translations = buildReminderAboutFeedbackResponseToTeachers(
    courseNamesAndUrls,
    courseName,
    allTeachers,
  )

  const email = {
    to: teacher.email,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

const sendEmailReminderAboutFeedbackResponseToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsWithoutResponseForTeachers()

  const emailsToBeSent = feedbackTargets.flatMap((fbt) =>
    fbt.users.map((user) =>
      emailReminderAboutFeedbackResponseToTeachers(user, fbt, fbt.users),
    ),
  )

  const ids = feedbackTargets.map((target) => target.id)

  FeedbackTarget.update(
    {
      feedbackResponseReminderEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    },
  )

  await pate.send(
    emailsToBeSent,
    'Remind teachers about giving counter feedback',
  )

  return emailsToBeSent
}

module.exports = {
  getFeedbackTargetsWithoutResponseForTeachers, // used by stats
  emailReminderAboutFeedbackResponseToTeachers, // used by stats
  sendEmailReminderAboutFeedbackResponseToTeachers,
}
