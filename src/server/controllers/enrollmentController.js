const { ApplicationError } = require('../util/customErrors')

const { getEnrollmentByPersonId } = require('../util/importerEnrolled')

const getEnrollmentsByUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)
  const { id } = user

  const enrollments = await getEnrollmentByPersonId(id)

  res.send(enrollments)
}

module.exports = {
  getEnrollmentsByUser,
}
