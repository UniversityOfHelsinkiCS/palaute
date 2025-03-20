const { Op } = require('sequelize')
const _ = require('lodash')

const { User, Organisation } = require('../../models')

const { normalizeOrganisationCode } = require('../../util/common')
const { getUserIamAccess, getAllUserAccess, getAccessToAll } = require('../../util/jami')

const getAccessFromIAMs = async user => {
  const access = {}

  const iamAccess = await getUserIamAccess(user)

  if (!_.isObject(iamAccess)) return access
  Object.keys(iamAccess).forEach(code => {
    access[normalizeOrganisationCode(code)] = iamAccess[code]
  })

  return access
}

const getFeedbackCorrespondentAccess = async user => {
  const organisations = await user.getOrganisations()

  if (organisations?.length > 0) {
    const access = {}
    organisations.forEach(org => {
      access[org.code] = { read: true, write: true, admin: true }
    })
    return access
  }

  return {}
}

const getOrganisationAccess = async user => {
  const access = {
    ...(await getAccessFromIAMs(user)),
    ...(await getFeedbackCorrespondentAccess(user)),
  }

  return access
}

const getAdminOrganisationAccess = () => getAccessToAll()

const getAllOrganisationAccess = async () => {
  const allAccess = await getAllUserAccess()

  const userIds = allAccess.map(({ id }) => id)

  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: userIds,
      },
    },
  })

  const usersWithAccess = []
  for (const user of users) {
    const { iamGroups, access } = allAccess.find(({ id }) => id === user.id)

    const normalizedAccess = {}
    Object.keys(access).forEach(code => {
      normalizedAccess[normalizeOrganisationCode(code)] = access[code]
    })

    const organisationCodes = Object.keys(normalizedAccess)
    const organisations = await Organisation.findAll({
      where: {
        code: {
          [Op.in]: organisationCodes,
        },
      },
    })

    const organisationAccess = organisations.map(org => ({
      access: normalizedAccess[org.code],
      organisation: org,
    }))

    const sortedOrganisationAccess = _.sortBy(organisationAccess, access => access.organisation.code)

    // eslint-disable-next-line no-continue
    if (!organisationAccess.length) continue

    usersWithAccess.push({
      ...user.dataValues,
      iamGroups,
      access: sortedOrganisationAccess,
    })
  }

  return usersWithAccess
}

module.exports = {
  getOrganisationAccess,
  getAdminOrganisationAccess,
  getAllOrganisationAccess,
}
