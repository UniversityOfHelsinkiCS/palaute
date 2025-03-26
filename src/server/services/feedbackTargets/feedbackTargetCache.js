// because of dark javascript import magic, important to require them directly (or try if it works the normal way)
const { Organisation } = require('../../models/organisation')
const { FeedbackTarget } = require('../../models/feedbackTarget')
const { Survey } = require('../../models/survey')
const { logger } = require('../../util/logger')
const { redis } = require('../../util/redisClient')
const { CourseRealisationsTag, CourseRealisation } = require('../../models')
const { FEEDBACK_TARGET_CACHE_TTL } = require('../../util/config')

const getKey = feedbackTargetId => `feedbackTarget:${feedbackTargetId}`

const cache = {
  get: async feedbackTargetId => {
    const feedbackTargetJson = await redis.get(getKey(feedbackTargetId))

    if (!feedbackTargetJson) return null

    return JSON.parse(feedbackTargetJson)
  },
  set: (feedbackTargetId, feedbackTarget) =>
    redis.set(getKey(feedbackTargetId), JSON.stringify(feedbackTarget), { EX: FEEDBACK_TARGET_CACHE_TTL }),
  invalidate: feedbackTargetId => {
    if (redis.delete(getKey(feedbackTargetId))) {
      logger.info(`[CACHE] invalidate fbt ${feedbackTargetId}`)
    }
  },
  invalidateAll: async () => {
    logger.info(`[CACHE] invalidate fbt ALL`)

    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    if (keys?.length > 0) redis.delete(keys)
  },
  entries: async () => {
    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    if (!(keys?.length > 0)) return [] // Passing an empty array to mGet causes an error, so we need to check this

    const cachedFeedbackTargets = await redis.mGet(keys)

    return cachedFeedbackTargets.map(JSON.parse).filter(Boolean)
  },
}

const onOrganisationChange = async organisationCode => {
  const cachedFeedbackTargets = await cache.entries()
  for (const fbt of cachedFeedbackTargets) {
    if (fbt.courseUnit.organisations.some(org => org.code === organisationCode)) {
      cache.invalidate(fbt.id)
    }
  }
}

const onFeedbackTargetChange = feedbackTarget => {
  cache.invalidate(feedbackTarget.id)
}

const onSurveyChange = survey => {
  if (survey.type === 'feedbackTarget') {
    cache.invalidate(survey.feedbackTargetId)
  } else if (survey.type === 'programme') {
    onOrganisationChange(survey.typeId)
  } else {
    cache.invalidateAll()
  }
}

const onTagChange = async curTag => {
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

module.exports = cache
