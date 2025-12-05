import { Op } from 'sequelize'
import { UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit, Organisation, User } from '../../models'
import { pate } from '../pateClient'
import { notificationAboutSurveyOpeningToStudents } from './sendEmailAboutSurveyOpeningToStudents'
import { createRecipientsForFeedbackTargets } from './util'

const getFeedbackTargetOpeningImmediately = async (feedbackTargetId: number) => {
  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      id: feedbackTargetId,
      feedbackType: 'courseRealisation',
      userCreated: false,
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

export const sendEmailToStudentsWhenOpeningImmediately = async (feedbackTargetId: number) => {
  const feedbackTarget = await getFeedbackTargetOpeningImmediately(feedbackTargetId)

  const studentsWithFeedbackTarget = await createRecipientsForFeedbackTargets([feedbackTarget], {
    whereOpenEmailNotSent: true,
    primaryOnly: false,
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
