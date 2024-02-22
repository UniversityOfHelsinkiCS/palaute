const redis = require('redis')
const Sentry = require('@sentry/node')
const logger = require('./logger')
const { REDIS_CONFIG } = require('./config')

const reconnectStrategy = attempts => {
  if (attempts > 0) throw Error('Connection failed')
  return 0 // Time to next reconnect attempt in milliseconds
}

const redisClient = redis.createClient({
  ...REDIS_CONFIG,
  socket: {
    reconnectStrategy,
  },
})

const client = {
  get: key => redisClient.get(key),
  set: (key, value, options = {}) => redisClient.set(key, value, options),
  expire: (key, seconds) => redisClient.expire(key, seconds),
  delete: key => redisClient.del(key),
  keys: pattern => redisClient.keys(pattern),
  mGet: keys => redisClient.mGet(keys),
  flushDb: () => redisClient.flushDb(),

  async testConnection() {
    try {
      await redisClient.connect(reconnectStrategy)

      await redisClient.set('key', 'value')
      await redisClient.get('key')
      await redisClient.del('key')
      logger.info('Redis client connected')
    } catch (error) {
      logger.warn('Connection to redis failed, cache not available')
      Sentry.captureException(new Error('Redis connection failed, cache not available'))
      client.get = () => Promise.resolve(null)
      client.set = () => Promise.resolve(null)
      client.flushDb = () => Promise.resolve(null)
      client.expire = () => Promise.resolve(null)
    }
  },

  async connect() {
    redisClient.on('error', err => logger.error('Redis Client Error', err))
    logger.info('Connecting to redis...', REDIS_CONFIG)
    await this.testConnection()
  },
}

module.exports = { redis: client }
