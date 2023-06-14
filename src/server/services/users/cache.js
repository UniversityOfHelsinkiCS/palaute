const LRU = require('lru-cache')
const logger = require('../../util/logger')

const lru = new LRU({
  max: 250,
})

const cache = {
  get: uid => lru.get(uid),
  set: (uid, userJson) => lru.set(uid, userJson),
  invalidate: uid => {
    if (lru.delete(uid)) {
      logger.info(`[CACHE] invalidate user ${uid}`)
    }
  },
  invalidateAll: () => {
    logger.info(`[CACHE] invalidate user ALL`)
    lru.clear()
  },
}

module.exports = cache
