const { OrganisationLog, Organisation, User } = require('../models')

const getOrganisationLogs = async (req, res) => {
  const { isAdmin } = req
  const { code } = req.params

  if (!isAdmin) {
    return res.send([])
  }

  const organisation = await Organisation.findOne({
    where: {
      code,
    },
    attributes: [],
    include: {
      model: OrganisationLog,
      as: 'organisationLogs',
      attributes: ['data', 'createdAt'],
      include: {
        model: User,
        as: 'user',
      },
    },
  })

  const organisationLogs = organisation.organisationLogs.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  )

  res.send(organisationLogs)
}

module.exports = {
  getOrganisationLogs,
}
