import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '../../util/logger'
import { checkRateLimit, RATE_LIMITS } from './rateLimit'

// Redis counters in a Map
const { counters, redis } = vi.hoisted(() => ({
  counters: new Map<string, number>(),
  redis: { incr: vi.fn<(key: string) => Promise<number>>(), expire: vi.fn(async () => true) },
}))

vi.mock('../../util/redisClient', () => ({ redis }))

const [perMinute, perDay, globalPerDay] = RATE_LIMITS

const START = new Date('2026-09-29T08:00:00Z')

const advanceMinutes = (minutes: number) => vi.setSystemTime(Date.now() + minutes * 60 * 1000)

const send = async (userId: string, times: number) => {
  for (let i = 0; i < times; i++) await checkRateLimit(userId)
}

// Stays under the per-minute limit
const sendSpread = async (userId: string, times: number) => {
  for (let i = 0; i < times; i++) {
    if (i > 0 && i % perMinute.max === 0) advanceMinutes(1)
    await checkRateLimit(userId)
  }
}

const expectRejected = async (userId: string, limit: string) => {
  await expect(checkRateLimit(userId)).rejects.toMatchObject({ status: 429 })
  expect(logger.warn).toHaveBeenLastCalledWith('[HelpChatbot] Rate limit exceeded', { userId, limit })
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    counters.clear()
    vi.clearAllMocks()
    redis.incr.mockImplementation(async key => {
      const count = (counters.get(key) ?? 0) + 1
      counters.set(key, count)
      return count
    })
    vi.useFakeTimers({ now: START })
    vi.spyOn(logger, 'warn').mockReturnValue(logger)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('allows requests up to the per-minute limit', async () => {
    await expect(send('user', perMinute.max)).resolves.toBeUndefined()
  })

  it('rejects the request over the per-minute limit', async () => {
    await send('user', perMinute.max)
    await expectRejected('user', perMinute.name)
  })

  it('allows requests again in the next minute', async () => {
    await send('user', perMinute.max)
    advanceMinutes(1)
    await expect(checkRateLimit('user')).resolves.toBeUndefined()
  })

  it('counts each user separately', async () => {
    await send('user', perMinute.max)
    await expect(checkRateLimit('other user')).resolves.toBeUndefined()
  })

  it('rejects the request over the per-day limit', async () => {
    await sendSpread('user', perDay.max)
    advanceMinutes(1)
    await expectRejected('user', perDay.name)
  })

  it('allows requests again the next day', async () => {
    await sendSpread('user', perDay.max)
    advanceMinutes(24 * 60)
    await expect(checkRateLimit('user')).resolves.toBeUndefined()
  })

  it('rejects everyone over the global per-day limit', async () => {
    const users = globalPerDay.max / perMinute.max
    for (let i = 0; i < users; i++) await send(`user ${i}`, perMinute.max)
    await expectRejected('new user', globalPerDay.name)
  })

  it("doesn't count a request rejected by a user limit towards the later limits", async () => {
    await send('user', perMinute.max)
    for (let i = 0; i < 5; i++) await expect(checkRateLimit('user')).rejects.toMatchObject({ status: 429 })

    const dayCount = (subject: string) =>
      counters.get(
        [...counters.keys()].find(key => key.startsWith(`helpChatbot:rate:${subject}:${perDay.windowSeconds}:`)) ?? ''
      )
    expect(dayCount('user:user')).toBe(perMinute.max)
    expect(dayCount('global')).toBe(perMinute.max)
  })

  it('sets the expiry once, when a window starts', async () => {
    await send('user', 3)
    expect(redis.expire).toHaveBeenCalledTimes(RATE_LIMITS.length)
    for (const { windowSeconds } of RATE_LIMITS) {
      expect(redis.expire).toHaveBeenCalledWith(expect.stringContaining(`:${windowSeconds}:`), windowSeconds)
    }
  })

  it('allows the request if Redis is unavailable', async () => {
    redis.incr.mockRejectedValue(new Error('The client is closed'))
    await expect(send('user', perMinute.max + 1)).resolves.toBeUndefined()
    expect(logger.warn).toHaveBeenCalledWith('[HelpChatbot] Rate limit not checked, Redis unavailable', {
      message: 'The client is closed',
    })
  })
})
