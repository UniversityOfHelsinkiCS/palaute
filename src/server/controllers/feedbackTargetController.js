const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

const { getResponsibleByPersonId } = require('../util/importerResponsible')
const { getEnrolmentByPersonId } = require('../util/importerEnrolled')
const {
  UserFeedbackTarget,
  FeedbackTarget,
  Feedback,
  CourseUnit,
} = require('../models')

const getResponsibleByUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)
  const { id } = user

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  const enrolments = await getResponsibleByPersonId(id, {
    startDateBefore,
    endDateAfter,
  })

  res.send(enrolments)
}

const getEnrolmentsByUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)
  const { id } = user

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  // acually useless data
  await getEnrolmentByPersonId(id, {
    startDateBefore,
    endDateAfter,
  })

  // acual megaquery

  const enrolments = await UserFeedbackTarget.findAll({
    where: {
      userId: id,
      accessStatus: 'STUDENT',
    },
    include: {
      model: FeedbackTarget,
      as: 'feedbackTarget',
      include: [{ model: CourseUnit, as: 'courseUnit' }],
    },
  })

  res.send(enrolments)
}

const getOneTarget = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const target = await UserFeedbackTarget.findByPk(Number(req.params.id), {
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        include: [{ model: CourseUnit, as: 'courseUnit' }],
      },
      {
        model: Feedback,
        as: 'feedback',
      },
    ],
  })

  if (!target) throw new ApplicationError('Not found', 404)

  res.send(target)
}

module.exports = {
  getResponsibleByUser,
  getEnrolmentsByUser,
  getOneTarget,
}
