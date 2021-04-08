const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

const { getEnrollmentByPersonId } = require('../util/importerEnrolled')

const getEnrollmentsByUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)
  const { id } = user

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  const enrollments = await getEnrollmentByPersonId(id, {
    startDateBefore,
    endDateAfter,
  })

  res.send(enrollments)
}

module.exports = {
  getEnrollmentsByUser,
}
