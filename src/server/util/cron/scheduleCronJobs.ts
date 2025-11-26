import { CRON_DISABLED } from '../config'
import { logger } from '../logger'
import { mailer } from '../../mailer'
import { start as startPrecacheFeedbackTargetsCron } from './precacheFeedbackTargetsCron'
import { start as startSummariesCron } from './summariesCron'

export const scheduleCronJobs = async () => {
  if (CRON_DISABLED) {
    logger.info('Not scheduling cron jobs because CRON_DISABLED is set to true')
    return
  }

  startSummariesCron()
  await startPrecacheFeedbackTargetsCron()
  await mailer.scheduleCronJobs()

  logger.info('Cron jobs scheduled')
}
