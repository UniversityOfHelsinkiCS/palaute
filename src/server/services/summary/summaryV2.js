const { Op } = require('sequelize')
const { Summary } = require('../../models')

const getSummaries = ({ entityId, accessibleOrganisations, courseRealisationIds, startDate, endDate }) => {
  const childOrganisations = accessibleOrganisations.filter(org => org.parentId === entityId)

  const entityIds = courseRealisationIds.concat(childOrganisations.map(org => org.id)).concat(entityId)

  console.log(startDate, endDate)

  return Summary.findAll({
    where: {
      entityId: {
        [Op.in]: entityIds,
      },
      startDate: {
        [Op.between]: [startDate, endDate],
      },
    },
  })
}

module.exports = {
  getSummaries,
}
