const { FeedbackTargetDateCheck } = require('../models')
const { sequelize } = require('./dbConnection')
const logger = require('./logger')

const run = async () => {
  logger.info('Running fbt date check')
  const relevantFeedbackTargets = await sequelize.query(
    `
    SELECT 
      DISTINCT feedback_targets.id as id

    FROM feedback_targets, course_realisations

    WHERE 
    course_realisations.id = feedback_targets.course_realisation_id
    AND (feedback_targets.closes_at - course_realisations.end_date > interval '16 days'
    OR feedback_targets.closes_at - course_realisations.end_date < interval '6 days')
    AND NOT feedback_targets.feedback_dates_edited_by_teacher
    AND ( feedback_targets.closes_at >= NOW() OR course_realisations.end_date >= NOW() );`,
    {
      type: sequelize.QueryTypes.SELECT,
    },
  )

  let updates = 0

  await Promise.all(
    relevantFeedbackTargets.map(async (fbt) => {
      try {
        await FeedbackTargetDateCheck.create({
          feedback_target_id: fbt.id,
          is_solved: false,
        })
        updates++
      } catch (err) {
        logger.info('was already on checklist')
      }
    }),
  )

  // Delete cases where the course has ended and feedback period has ended 16 or more days ago
  const deletes = await sequelize.query(
    `
    DELETE FROM feedback_target_date_checks
    USING course_realisations, feedback_targets
    WHERE 
    feedback_target_date_checks.feedback_target_id = feedback_targets.id
    AND course_realisations.id = feedback_targets.course_realisation_id
    AND NOW() - feedback_targets.closes_at > interval '16 days'
    AND course_realisations.end_date < NOW()

    RETURNING feedback_target_date_checks.id;
    `,
    {
      type: sequelize.QueryTypes.DELETE,
    },
  )

  return { updates, deletes: deletes.length }
}

module.exports = {
  run,
}
