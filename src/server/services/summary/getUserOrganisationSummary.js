const { Op } = require('sequelize')
const { SUMMARY_EXCLUDED_ORG_IDS } = require('../../util/config')
const { getSummaryAccessibleOrganisationIds } = require('./access')
const { Summary, Organisation } = require('../../models')
const { sumSummaries } = require('./utils')
const { ApplicationError } = require('../../util/customErrors')

const getUserOrganisationSummaries = async ({ startDate, endDate, user, viewingMode = 'flat' }) => {
  const organisationIds = await getSummaryAccessibleOrganisationIds(user)

  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code', 'parentId'],
    where: {
      id: {
        [Op.in]: organisationIds,
        [Op.notIn]: SUMMARY_EXCLUDED_ORG_IDS,
      },
    },
    include: {
      model: Summary.scope({ method: ['at', startDate, endDate] }),
      as: 'summaries',
      required: false,
    },
    order: [['code', 'ASC']],
  })

  const organisationsJson = organisations.map(org => {
    org.summary = sumSummaries(org.summaries)
    delete org.dataValues.summaries
    return org.toJSON()
  })

  if (viewingMode === 'flat') {
    return organisationsJson
  }

  if (viewingMode === 'tree') {
    const rootOrganisations = []
    for (const org of organisationsJson) {
      const parentOrg = organisationsJson.find(o => o.id === org.parentId)
      if (!parentOrg) {
        rootOrganisations.push(org)
      } else {
        if (!parentOrg.childOrganisations) {
          parentOrg.childOrganisations = []
        }
        parentOrg.childOrganisations.push(org)
        parentOrg.initiallyExpanded = true
      }
    }

    return rootOrganisations
  }

  return ApplicationError.BadRequest(`Invalid viewing mode ${viewingMode}`)
}

module.exports = {
  getUserOrganisationSummaries,
}
