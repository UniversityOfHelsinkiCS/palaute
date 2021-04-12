const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

const { getResponsibleByPersonId } = require('../util/importerResponsible')
const { getEnrolmentByPersonId } = require('../util/importerEnrolled')
const { FeedbackTarget } = require('../models')
const { CourseUnit } = require('../models/feedbackTarget')

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

  const enrolments = await getEnrolmentByPersonId(id, {
    startDateBefore,
    endDateAfter,
  })

  res.send(enrolments)
}

const getOneTarget = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const target = await FeedbackTarget.findByPk(Number(req.params.id), {
    include: CourseUnit,
  })

  if (!target) throw new ApplicationError('Not found', 404)

  res.send(target)
}

module.exports = {
  getResponsibleByUser,
  getEnrolmentsByUser,
  getOneTarget,
}
