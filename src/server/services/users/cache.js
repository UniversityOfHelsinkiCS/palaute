const LRU = require('lru-cache')
const logger = require('../../util/logger')
const { USER_CACHE_SIZE, USER_CACHE_TTL } = require('../../util/config')

const lru = new LRU({
  max: USER_CACHE_SIZE,
  ttl: USER_CACHE_TTL,
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
