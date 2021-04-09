const dateFns = require('date-fns')
const { ApplicationError } = require('../util/customErrors')

const { getResponsibleByPersonId } = require('../util/importerResponsible')

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

module.exports = {
  getResponsibleByUser,
}
