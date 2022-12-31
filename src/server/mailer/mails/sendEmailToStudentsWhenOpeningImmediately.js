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
const { notificationAboutSurveyOpeningToStudents } = require('./sendEmailAboutSurveyOpeningToStudents')
const { createRecipientsForFeedbackTargets } = require('./util')

const getFeedbackTargetOpeningImmediately = async feedbackTargetId => {
  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      id: feedbackTargetId,
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
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
      },
    ],
  })

  return feedbackTarget
}

const sendEmailToStudentsWhenOpeningImmediately = async feedbackTargetId => {
  const feedbackTarget = await getFeedbackTargetOpeningImmediately(feedbackTargetId)

  const studentsWithFeedbackTarget = await createRecipientsForFeedbackTargets([feedbackTarget], {
    whereOpenEmailNotSent: true,
  })

  const studentEmailsToBeSent = Object.keys(studentsWithFeedbackTarget).map(student =>
    notificationAboutSurveyOpeningToStudents(student, studentsWithFeedbackTarget[student])
  )

  const ids = Object.values(studentsWithFeedbackTarget).flatMap(fbts => fbts.map(fbt => fbt.userFeedbackTargetId))

  await UserFeedbackTarget.update(
    {
      feedbackOpenEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    }
  )

  await pate.send(studentEmailsToBeSent, 'Notify students about feedback opening immediately')

  return studentEmailsToBeSent
}

module.exports = {
  sendEmailToStudentsWhenOpeningImmediately,
}
