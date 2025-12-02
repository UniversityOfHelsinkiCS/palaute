import { Organisation } from '../../models/organisation'
import { FeedbackTarget } from '../../models/feedbackTarget'
import { Survey } from '../../models/survey'
import { logger } from '../../util/logger'
import { redis } from '../../util/redisClient'
import { CourseRealisationsTag, CourseRealisation } from '../../models'
import { FEEDBACK_TARGET_CACHE_TTL } from '../../util/config'

const getKey = (feedbackTargetId: number | string) => `feedbackTarget:${feedbackTargetId}`

const cache = {
  get: async (feedbackTargetId: number | string) => {
    const feedbackTargetJson = await redis.get(getKey(feedbackTargetId))

    if (!feedbackTargetJson) return null

    return JSON.parse(feedbackTargetJson)
  },
  set: (feedbackTargetId: number | string, feedbackTarget: any) =>
    redis.set(getKey(feedbackTargetId), JSON.stringify(feedbackTarget), { EX: FEEDBACK_TARGET_CACHE_TTL }),
  invalidate: (feedbackTargetId: number | string) => {
    if (redis.delete(getKey(feedbackTargetId))) {
      logger.info(`[CACHE] invalidate fbt ${feedbackTargetId}`)
    }
  },
  invalidateAll: async () => {
    logger.info('[CACHE] invalidate fbt ALL')

    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    if (keys?.length > 0) redis.delete(keys)
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
      cache.invalidate(fbt.id)
    }
  }
}

const onFeedbackTargetChange = (feedbackTarget: FeedbackTarget) => {
  cache.invalidate(feedbackTarget.id)
}

const onSurveyChange = (survey: Survey) => {
  if (survey.type === 'feedbackTarget') {
    cache.invalidate(survey.feedbackTargetId as number)
  } else if (survey.type === 'programme') {
    onOrganisationChange(survey.typeId as string)
  } else {
    cache.invalidateAll()
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

Organisation.afterUpdate(({ code }) => onOrganisationChange(code))
Organisation.afterSave(({ code }) => onOrganisationChange(code))

FeedbackTarget.afterUpdate(onFeedbackTargetChange)
FeedbackTarget.afterSave(onFeedbackTargetChange)

Survey.afterUpdate(onSurveyChange)
Survey.afterSave(onSurveyChange)

CourseRealisationsTag.afterCreate(onTagChange)
CourseRealisationsTag.beforeDestroy(onTagChange)

export default cache
