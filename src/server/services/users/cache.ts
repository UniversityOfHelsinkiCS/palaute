import { logger } from '../../util/logger'
import { USER_CACHE_TTL } from '../../util/config'
import { redis } from '../../util/redisClient'
import { User } from '../../models'

const getKey = (uid: string) => `user:${uid}`

const cache = {
  get: async (uid: string) => {
    const userJson = await redis.get(getKey(uid))

    if (!userJson) return null

    return User.build(JSON.parse(userJson))
  },
  set: (uid: string, user: any) => redis.set(getKey(uid), JSON.stringify(user), { EX: USER_CACHE_TTL }),
  invalidate: (uid: string) => {
    if (redis.delete(getKey(uid))) {
      logger.info(`[CACHE] invalidate user ${uid}`)
    }
  },
  invalidateAll: async () => {
    logger.info('[CACHE] invalidate user ALL')

    const pattern = getKey('*')
    const keys = await redis.keys(pattern)
    if (keys?.length > 0) await redis.delete(keys)
  },
}

export default cache
