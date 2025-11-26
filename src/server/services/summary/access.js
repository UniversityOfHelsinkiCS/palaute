const { getUserOrganisationAccess } = require('../organisationAccess/organisationAccess')
const { sequelize } = require('../../db/dbConnection')

const getSummaryAccessibleOrganisationIds = async user => {
  const organisationAccess = await getUserOrganisationAccess(user)
  const accessibleOrganisationIds = organisationAccess.flatMap(access => [
    access.organisation.id,
    access.organisation.parentId,
  ])

  return accessibleOrganisationIds
}

const getAccessibleCourseRealisationIds = async user => {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_realisations.id) course_realisations.id
    FROM user_feedback_targets
    INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    WHERE user_feedback_targets.user_id = :userId
    AND is_teacher(user_feedback_targets.access_status)
    AND feedback_targets.feedback_type = 'courseRealisation'
    AND course_realisations.start_date > NOW() - interval '24 months';
  `,
    {
      replacements: {
        userId: user.id,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return rows.map(row => row.id)
}

module.exports = {
  getSummaryAccessibleOrganisationIds,
  getAccessibleCourseRealisationIds,
}
