const LRUCache = require('lru-cache')

// because of dark javascript import magic, important to require them directly (or try if it works the normal way)
const Organisation = require('../../models/organisation')
const FeedbackTarget = require('../../models/feedbackTarget')
const Survey = require('../../models/survey')
const logger = require('../../util/logger')

const lru = new LRUCache({
  max: 250,
})

const cache = {
  get: (feedbackTargetId) => lru.get(feedbackTargetId),
  set: (id, feedbackTargetJson) => lru.set(id, feedbackTargetJson),
  invalidate: (feedbackTargetId) => {
    logger.info(`[CACHE] invalidate fbt ${feedbackTargetId}`)
    lru.delete(feedbackTargetId)
  },
  invalidateAll: () => {
    logger.info(`[CACHE] invalidate fbt ALL`)
    lru.clear()
  },
}

const onOrganisationChange = (organisationCode) => {
  const idstoInvalidate = []
  for (const [key, fbt] of lru.entries()) {
    if (
      fbt.courseUnit.organisations.some((org) => org.code === organisationCode)
    ) {
      idstoInvalidate.push(key)
    }
  }
  idstoInvalidate.forEach(cache.invalidate)
}

const onFeedbackTargetChange = (feedbackTarget) => {
  cache.invalidate(feedbackTarget.id)
}

const onSurveyChange = (survey) => {
  if (survey.type === 'feedbackTarget') {
    cache.invalidate(survey.feedbackTargetId)
  } else if (survey.type === 'programme') {
    onOrganisationChange(survey.typeId)
  } else {
    cache.invalidateAll()
  }
}

Organisation.afterUpdate(({ code }) => onOrganisationChange(code))
Organisation.afterSave(({ code }) => onOrganisationChange(code))

FeedbackTarget.afterUpdate(onFeedbackTargetChange)
FeedbackTarget.afterSave(onFeedbackTargetChange)

Survey.afterUpdate(onSurveyChange)
Survey.afterSave(onSurveyChange)

module.exports = cache
