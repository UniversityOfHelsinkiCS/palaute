const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

const { getEnrolmentByPersonId } = require('../util/importerEnrolled')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  CourseRealisation,
} = require('../models')

const getForStudent = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const { id } = user

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  await getEnrolmentByPersonId(id, {
    startDateBefore,
    endDateAfter,
  })

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: id,
      accessStatus: 'STUDENT',
    },
    include: {
      model: FeedbackTarget,
      as: 'feedbackTarget',
      include: [
        { model: CourseUnit, as: 'courseUnit' },
        { model: CourseRealisation, as: 'courseRealisation' },
      ],
    },
  })

  const feedbackTargets = userFeedbackTargets.map(
    ({ feedbackTarget, feedbackId, accessStatus }) => ({
      ...feedbackTarget.toJSON(),
      feedbackId,
      accessStatus,
    }),
  )

  res.send(feedbackTargets)
}

module.exports = {
  getForStudent,
}
