import { sequelize } from '../../db/dbConnection'
import { FeedbackTarget } from '../../models'
import { FEEDBACK_REMINDER_COOLDOWN, STUDENT_REMINDER_DAYS_TO_CLOSE } from '../../util/config'
import { logger } from '../../util/logger'
import { sendFeedbackReminderToStudents } from './sendFeedbackReminderToStudents'

/**
 * Automatically remind students 3 days before feedback closes
 * and feedback target has student list visible (SOS-feature)
 */
export const sendAutomaticReminderOnFeedbackToStudents = async () => {
  const feedbackTargets = await sequelize.query(
    `
    SELECT DISTINCT fbt.*, cur.name as "courseRealisationName"
    FROM feedback_targets as fbt

    INNER JOIN course_realisations as cur ON cur.id = fbt.course_realisation_id
    INNER JOIN course_units as cu ON cu.id = fbt.course_unit_id
    INNER JOIN course_units_organisations as cuo ON cu.id = cuo.course_unit_id
    INNER JOIN organisations as org ON org.id = cuo.organisation_id

    WHERE fbt.closes_at > NOW() + interval '0 days'
    AND fbt.closes_at < NOW() + interval '${STUDENT_REMINDER_DAYS_TO_CLOSE} days'
    AND (
      fbt.feedback_reminder_last_sent_at IS NULL
      OR fbt.feedback_reminder_last_sent_at < NOW() - interval '${FEEDBACK_REMINDER_COOLDOWN} hours'
    )
    AND fbt.user_created = false
  `,
    {
      model: FeedbackTarget,
      mapToModel: true,
    }
  )

  logger.info(`[Pate] Sending automatic reminder for ${feedbackTargets.length} feedback targets`)

  await Promise.all(
    feedbackTargets.map(async fbt => {
      if (await fbt?.feedbackCanBeGiven()) {
        return sendFeedbackReminderToStudents(fbt, '', fbt.get('courseRealisationName'))
      }
      return null
    })
  )
}
