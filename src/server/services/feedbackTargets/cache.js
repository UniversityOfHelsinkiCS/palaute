const LRUCache = require('lru-cache')

const cache = new LRUCache({
  max: 250,
})

module.exports = {
  get: (feedbackTargetId) => cache.get(feedbackTargetId),
  set: (id, feedbackTargetJson) => cache.set(id, feedbackTargetJson),
  invalidate: (feedbackTargetId) => cache.delete(feedbackTargetId),
  invalidateAll: () => cache.clear(),
}
