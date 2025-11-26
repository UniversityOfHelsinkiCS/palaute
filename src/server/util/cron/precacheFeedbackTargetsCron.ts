import _ from 'lodash'
import { Op, fn, col } from 'sequelize'
import { subDays } from 'date-fns'
import { inProduction, inStaging } from '../config'
import { logger } from '../logger'
import { schedule } from './schedule'
import { FeedbackTarget, UserFeedbackTarget } from '../../models'
import { cacheFeedbackTargetById } from '../../services/feedbackTargets'

const run = async () => {
  const start = Date.now()

  const feedbackTargetsOpeningToday = await FeedbackTarget.findAll({
    attributes: ['id', [fn('COUNT', col('userFeedbackTargets.id')), 'studentCount']],
    where: {
      opensAt: {
        [Op.between]: [subDays(new Date(), 1), new Date()],
      },
    },
    include: {
      model: UserFeedbackTarget,
      attributes: [],
      as: 'userFeedbackTargets',
      required: true,
      where: { accessStatus: 'STUDENT' },
    },
    group: ['FeedbackTarget.id'],
  })

  // cache 200 of the biggest courses.
  // Put biggest to cache last so it stays there the longest.
  const ordered = _.orderBy(feedbackTargetsOpeningToday, [['studentCount', 'desc']])

  for (const fbt of _.reverse(_.take(ordered, 200))) {
    await cacheFeedbackTargetById(fbt.id)
  }

  logger.info(`
    Precached ${ordered.length} feedback targets with a total of ${_.sumBy(
      ordered,
      'studentCount'
    )} students, total time ${((Date.now() - start) / 1000).toFixed()}s`)
}

export const start = async () => {
  const cronTime = '10 3 * * *' // 3.10 am
  if (!inProduction || inStaging) {
    return logger.info('Not precaching feedback targets outside production')
  }
  return schedule(cronTime, run)
}
