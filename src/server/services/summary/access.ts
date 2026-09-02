import { QueryTypes } from 'sequelize'

import { sequelize } from '../../db/dbConnection'
import { User } from '../../models'
import { SUMMARY_EXCLUDED_ORG_IDS } from '../../util/config'
import { getUserOrganisationAccess } from '../organisationAccess/organisationAccess'

/**
 * Organisations the user may navigate: the ones they have access to, plus their parents.
 * The parents are included only so that a parent row can be rendered and expanded to reach
 * the accessible children. Do not use this to decide whether the contents (course units, tags)
 * of an organisation may be shown - use getDirectlyAccessibleOrganisationIds for that.
 */
export const getSummaryAccessibleOrganisationIds = async (user: User) => {
  const organisationAccess = await getUserOrganisationAccess(user)
  const excludedIds = new Set(SUMMARY_EXCLUDED_ORG_IDS)
  const accessibleOrganisationIds = organisationAccess
    // Excluded organisations should not contribute their parentId to the accessible set.
    .filter(access => !excludedIds.has(access.organisation.id))
    .flatMap(access => [access.organisation.id, access.organisation.parentId])
    .filter((id): id is string => Boolean(id))

  return accessibleOrganisationIds
}

/**
 * Organisations the user acually has access to, without the navigational parents.
 * Only these organisations' own course units and tags may be shown to the user.
 */
export const getDirectlyAccessibleOrganisationIds = async (user: User) => {
  const organisationAccess = await getUserOrganisationAccess(user)
  const excludedIds = new Set(SUMMARY_EXCLUDED_ORG_IDS)

  return organisationAccess.map(access => access.organisation.id).filter(id => !excludedIds.has(id))
}

export const getAccessibleCourseRealisationIds = async (user: User) => {
  const rows = await sequelize.query<{ id: string }>(
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
      type: QueryTypes.SELECT,
    }
  )

  return rows.map(row => row.id)
}
