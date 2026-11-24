import type { Transaction } from 'sequelize'

import { CourseRealisationsTag, CourseRealisation } from '../../models'
import { FeedbackTarget } from '../../models/feedbackTarget'
import { Organisation } from '../../models/organisation'
import { Survey } from '../../models/survey'
import { FEEDBACK_TARGET_CACHE_TTL } from '../../util/config'
import { logger } from '../../util/logger'
import { redis } from '../../util/redisClient'

// Change the version when the cached shape changes, so entries in the old shape aren't read
const getKey = (feedbackTargetId: number | string) => `feedbackTarget:v2:${feedbackTargetId}`

const cache = {
  get: async (feedbackTargetId: number | string) => {
    const feedbackTargetJson = await redis.get(getKey(feedbackTargetId))

    if (!feedbackTargetJson) return null

    return JSON.parse(feedbackTargetJson)
  },
  set: (feedbackTargetId: number | string, feedbackTarget: any) =>
    redis.set(getKey(feedbackTargetId), JSON.stringify(feedbackTarget), { EX: FEEDBACK_TARGET_CACHE_TTL }),
  invalidate: async (feedbackTargetId: number | string) => {
    if (await redis.delete(getKey(feedbackTargetId))) {
      logger.info(`[CACHE] invalidate fbt ${feedbackTargetId}`)
    }
  },
  invalidateAll: async () => {
    logger.info('[CACHE] invalidate fbt ALL')

    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    if (keys?.length > 0) await redis.delete(keys)
  },
  entries: async () => {
    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    if (!(keys?.length > 0)) return [] // Passing an empty array to mGet causes an error, so we need to check this

    const cachedFeedbackTargets = await redis.mGet(keys)

    return cachedFeedbackTargets.map((json: string | null) => (json ? JSON.parse(json) : null)).filter(Boolean)
  },
}

const onOrganisationChange = async (organisationCode: string) => {
  const cachedFeedbackTargets = await cache.entries()
  for (const fbt of cachedFeedbackTargets) {
    if (fbt.courseUnit.organisations.some((org: any) => org.code === organisationCode)) {
      await cache.invalidate(fbt.id)
    }
  }
}

const onFeedbackTargetChange = (feedbackTarget: FeedbackTarget) => cache.invalidate(feedbackTarget.id)

const onSurveyChange = (survey: Survey) => {
  if (survey.type === 'feedbackTarget') return cache.invalidate(survey.feedbackTargetId)
  if (survey.type === 'programme') return onOrganisationChange(survey.typeId)
  return cache.invalidateAll()
}

// Invalidating before commit lets a concurrent read cache the old data again.
// Errors are only logged, they would fail a request whose changes are already saved
const afterCommit =
  <T>(invalidate: (instance: T) => Promise<unknown>) =>
  async (instance: T, options: { transaction?: Transaction | null }) => {
    const safeInvalidate = async () => {
      await invalidate(instance).catch(error => logger.error('[CACHE] invalidation failed', { error }))
    }
    if (options?.transaction) {
      options.transaction.afterCommit(safeInvalidate)
    } else {
      await safeInvalidate()
    }
  }

const onTagChange = async (curTag: CourseRealisationsTag) => {
  const fbts = await FeedbackTarget.findAll({
    attributes: ['id'],
    include: {
      model: CourseRealisation,
      required: true,
      where: { id: curTag.courseRealisationId },
    },
  })
  fbts.map(({ id }) => id).forEach(cache.invalidate)
}

const onOrganisationSave = afterCommit(({ code }: Organisation) => onOrganisationChange(code))
Organisation.afterUpdate(onOrganisationSave)
Organisation.afterSave(onOrganisationSave)

FeedbackTarget.afterUpdate(afterCommit(onFeedbackTargetChange))
FeedbackTarget.afterSave(afterCommit(onFeedbackTargetChange))

Survey.afterUpdate(afterCommit(onSurveyChange))
Survey.afterSave(afterCommit(onSurveyChange))

CourseRealisationsTag.afterCreate(onTagChange)
CourseRealisationsTag.beforeDestroy(onTagChange)

export default cache
