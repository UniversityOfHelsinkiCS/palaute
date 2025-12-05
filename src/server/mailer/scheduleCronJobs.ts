import { inProduction, inStaging, SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED } from '../util/config'
import { logger } from '../util/logger'
import { schedule } from '../util/cron/schedule'

import {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailReminderAboutFeedbackResponseToTeachers,
  sendAutomaticReminderOnFeedbackToStudents,
  sendEmailContinuousFeedbackDigestToTeachers,
} from './mails'

export const runContinuousFeedbackCron = async () => {
  logger.info('Running continuous feedback digest cron')
  await sendEmailContinuousFeedbackDigestToTeachers()
}

const startContinuousFeedbackCron = async () => {
  if (!inProduction || inStaging) {
    return logger.info('Not running continuous feedback cron if not in production')
  }
  logger.info('Setup continuous feedback cron')
  const cronTime = '0 8 * * *' // Daily at 8:00

  return schedule(cronTime, runContinuousFeedbackCron)
}

export const runPateCron = async () => {
  logger.info('Running pate cron')
  await sendEmailAboutSurveyOpeningToStudents()
  await sendEmailReminderAboutSurveyOpeningToTeachers()
  await sendEmailReminderAboutFeedbackResponseToTeachers()
  if (SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED) {
    await sendAutomaticReminderOnFeedbackToStudents()
  }
}

const startPateCron = async () => {
  // run()
  if (!inProduction || inStaging) {
    return logger.info('Not running Pate if not in production')
  }
  logger.info('Setup pate cron')
  const cronTime = '15 11 * * *' // Daily at 11:15

  return schedule(cronTime, runPateCron)
}

export const scheduleCronJobs = async () => {
  await startPateCron()
  await startContinuousFeedbackCron()
}
