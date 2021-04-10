const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

// onst { getEnrolmentByPersonId } = require('../util/importerEnrolled')

const getEnrolmentsByUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)
  // const { id } = user 

  // const startDateBefore = dateFns.subDays(new Date(), 14)
  // const endDateAfter = dateFns.subDays(new Date(), 14)

  /* const enrolments = await getEnrolmentByPersonId(id, {
    startDateBefore,
    endDateAfter,
  }) */

  res.send([])
}

module.exports = {
  getEnrolmentsByUser,
}
