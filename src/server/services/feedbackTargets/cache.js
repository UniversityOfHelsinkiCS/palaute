const LRUCache = require('lru-cache')
const { Organisation, Survey } = require('../../models')

const lru = new LRUCache({
  max: 250,
})

const cache = {
  get: (feedbackTargetId) => lru.get(feedbackTargetId),
  set: (id, feedbackTargetJson) => lru.set(id, feedbackTargetJson),
  invalidate: (feedbackTargetId) => lru.delete(feedbackTargetId),
  invalidateAll: () => lru.clear(),
}

Organisation.afterUpdate('invalidateFeedbackTargetCache', () => {
  cache.invalidateAll()
})

Survey.afterUpdate('invalidateFeedbackTargetCache', (survey) => {
  if (survey.type === 'feedbackTarget') {
    cache.invalidate(survey.feedbackTargetId)
  } else {
    cache.invalidateAll()
  }
})

module.exports = cache
