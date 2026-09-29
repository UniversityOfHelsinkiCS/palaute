import { ApplicationError } from '../../util/ApplicationError'
import { logger } from '../../util/logger'
import { redis } from '../../util/redisClient'

const MINUTE = 60
const DAY = 24 * 60 * 60

// Checked in order, so a request rejected by a user's limit doesn't use up the global budget.
// The global limit is a circuit breaker; to cut the chatbot off entirely, see "Backend" in documentation/help_chatbot.md.
export const RATE_LIMITS = [
  { name: 'user per minute', scope: 'user', windowSeconds: MINUTE, max: 10 },
  { name: 'user per day', scope: 'user', windowSeconds: DAY, max: 100 },
  { name: 'global per day', scope: 'global', windowSeconds: DAY, max: 2000 },
] as const

// Fails open: if Redis is unavailable, the request is allowed. The redisClient wrapper already turns incr into
// a no-op when Redis is down at startup; this also covers a connection lost later, when commands reject.
const increment = async (key: string, windowSeconds: number) => {
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, windowSeconds)
    return count
  } catch (error) {
    logger.warn('[HelpChatbot] Rate limit not checked, Redis unavailable', {
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return 0
  }
}

// Fixed windows. The window's index is part of the key, so a key that somehow lost its expiry can't block anyone for good.
export const checkRateLimit = async (userId: string) => {
  for (const { name, scope, windowSeconds, max } of RATE_LIMITS) {
    const window = Math.floor(Date.now() / 1000 / windowSeconds)
    const subject = scope === 'user' ? `user:${userId}` : 'global'
    const key = `helpChatbot:rate:${subject}:${windowSeconds}:${window}`

    const count = await increment(key, windowSeconds)

    if (count > max) {
      logger.warn('[HelpChatbot] Rate limit exceeded', { userId, limit: name })
      throw new ApplicationError('Rate limit exceeded', 429)
    }
  }
}
