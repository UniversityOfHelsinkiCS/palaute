const { User } = require('../../models')

const logger = require('../../util/logger')
const { redis } = require('../../util/redisClient')

const { USER_CACHE_TTL } = require('../../util/config')

const getKey = uid => `user:${uid}`

const cache = {
  get: async uid => {
    const userJson = await redis.get(getKey(uid))

    if (!userJson) return null

    return User.build(JSON.parse(userJson))
  },
  set: (uid, user) => {
    redis.set(getKey(uid), JSON.stringify(user), { ttl: USER_CACHE_TTL })
  },
  invalidate: uid => {
    if (redis.delete(getKey(uid))) {
      logger.info(`[CACHE] invalidate user ${uid}`)
    }
  },
  invalidateAll: async () => {
    logger.info(`[CACHE] invalidate user ALL`)

    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    redis.delete(keys)
  },
}

module.exports = cache
