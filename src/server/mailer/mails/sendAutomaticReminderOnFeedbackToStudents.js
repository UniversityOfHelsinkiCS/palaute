const { sequelize } = require('../../db/dbConnection')
const { FeedbackTarget } = require('../../models')
const { FEEDBACK_REMINDER_COOLDOWN } = require('../../util/config')
const logger = require('../../util/logger')
const { sendFeedbackReminderToStudents } = require('./sendFeedbackReminderToStudents')

/**
 * Automatically remind students 3 days before feedback closes
 * and feedback target has student list visible (SOS-feature)
 */
const sendAutomaticReminderOnFeedbackToStudents = async () => {
  const feedbackTargets = await sequelize.query(
    `
    SELECT DISTINCT fbt.*
    FROM feedback_targets as fbt

    INNER JOIN course_units as cu ON cu.id = fbt.course_unit_id
    INNER JOIN course_units_organisations as cuo ON cu.id = cuo.course_unit_id
    INNER JOIN organisations as org ON org.id = cuo.organisation_id

    WHERE cu.course_code = ANY (org.student_list_visible_course_codes)
    AND fbt.closes_at > NOW() + interval '0 days'
    AND fbt.closes_at < NOW() + interval '3 days' -- 3 days before
    AND (
      fbt.feedback_reminder_last_sent_at IS NULL
      OR fbt.feedback_reminder_last_sent_at < NOW() - interval ':cooldown hours'
    )
  `,
    {
      replacements: { cooldown: FEEDBACK_REMINDER_COOLDOWN },
      model: FeedbackTarget,
      mapToModel: true,
    }
  )

  logger.info(`[Pate] Sending automatic reminder for ${feedbackTargets.length} feedback targets`)

  await Promise.all(
    feedbackTargets.map(async fbt => {
      if (await fbt?.feedbackCanBeGiven()) {
        return sendFeedbackReminderToStudents(fbt, '')
      }
      return null
    })
  )
}

module.exports = {
  sendAutomaticReminderOnFeedbackToStudents,
}
