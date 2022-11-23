const { redis } = require('./redisClient')

const updateLastRestart = async () => {
  const now = Date.now()
  await redis.set('LAST_RESTART', now)
}

const getLastRestart = async () => {
  const str = await redis.get('LAST_RESTART')
  const int = Number(str)
  return new Date(int)
}

module.exports = {
  updateLastRestart,
  getLastRestart,
}
