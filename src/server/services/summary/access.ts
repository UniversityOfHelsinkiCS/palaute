import { QueryTypes } from 'sequelize'
import { User } from 'models'
import { sequelize } from '../../db/dbConnection'
import { getUserOrganisationAccess } from '../organisationAccess/organisationAccess'

export const getSummaryAccessibleOrganisationIds = async (user: User) => {
  const organisationAccess = await getUserOrganisationAccess(user)
  const accessibleOrganisationIds = organisationAccess.flatMap(access => [
    access.organisation.id,
    access.organisation.parentId,
  ])

  return accessibleOrganisationIds
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
