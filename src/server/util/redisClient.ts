import { createClient } from 'redis'
import * as Sentry from '@sentry/node'
import { logger } from './logger'
import { REDIS_CONFIG } from './config'

const reconnectStrategy = (attempts: number) => {
  if (attempts > 0) throw Error('Connection failed')
  return 0 // Time to next reconnect attempt in milliseconds
}

const redisClient = createClient({
  ...REDIS_CONFIG,
  socket: {
    reconnectStrategy,
  },
})

const client = {
  get: (key: string) => redisClient.get(key),
  set: (key: string, value: string, options = {}) => redisClient.set(key, value, options),
  expire: (key: string, seconds: number) => redisClient.expire(key, seconds),
  delete: (key: string | string[]) => redisClient.del(key),
  keys: (pattern: string) => redisClient.keys(pattern),
  mGet: (keys: string[]) => redisClient.mGet(keys),
  flushDb: () => redisClient.flushDb(),

  async testConnection() {
    try {
      await redisClient.connect()

      await redisClient.set('key', 'value')
      await redisClient.get('key')
      await redisClient.del('key')
      logger.info('Redis client connected')
    } catch (error) {
      logger.warn('Connection to redis failed, cache not available')
      Sentry.captureException(new Error('Redis connection failed, cache not available'))
      // Mock the client methods to avoid errors
      client.get = () => Promise.resolve(null)
      client.set = () => Promise.resolve(null)
      client.expire = () => Promise.resolve(false)
      client.delete = () => Promise.resolve(0)
      client.keys = () => Promise.resolve([])
      client.mGet = () => Promise.resolve([])
      client.flushDb = () => Promise.resolve('OK')
    }
  },

  async connect() {
    redisClient.on('error', (err: any) => logger.error('Redis Client Error', err))
    logger.info('Connecting to redis...', REDIS_CONFIG)
    await this.testConnection()
  },
}

export const redis = client
