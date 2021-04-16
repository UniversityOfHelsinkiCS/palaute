const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

const { getEnrolmentByPersonId } = require('../util/importerEnrolled')
const { UserFeedbackTarget, FeedbackTarget, CourseUnit } = require('../models')

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
    },
    include: {
      model: FeedbackTarget,
      include: [CourseUnit],
    },
  })

  res.send(enrolments)
}

module.exports = {
  getEnrolmentsByUser,
}
