const redis = require('redis')
const logger = require('./logger')
const { REDIS_CONFIG } = require('./config')

const reconnectStrategy = (attempts) => {
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
  get: (key) => redisClient.get(key),
  set: (key, value) => redisClient.set(key, value),
  expire: (key, seconds) => redisClient.expire(key, seconds),
  delete: (key) => redisClient.del(key),
  flushDb: () => redisClient.flushDb(),
  connect: async () => {
    redisClient.on('error', (err) => logger.error('Redis Client Error', err))
    logger.info('Connecting to redis...', REDIS_CONFIG)

    try {
      await redisClient.connect(reconnectStrategy)

      await redisClient.set('key', 'value')
      await redisClient.get('key')
      await redisClient.del('key')
    } catch (error) {
      logger.warn('Connection to redis failed, cache not available')
      client.get = () => Promise.resolve(null)
      client.set = () => Promise.resolve(null)
      client.flushDb = () => Promise.resolve(null)
      return
    }

    logger.info('Redis client connected')
  },
}

module.exports = { redis: client }
