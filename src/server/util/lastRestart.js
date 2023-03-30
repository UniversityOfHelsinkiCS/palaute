const { redis } = require('./redisClient')

let lastRestart = null

const updateLastRestart = async () => {
  const now = Date.now()
  lastRestart = now
  await redis.set('LAST_RESTART', now)
}

const getLastRestart = async () => {
  const str = (await redis.get('LAST_RESTART')) ?? lastRestart
  const int = Number(str)
  return new Date(int)
}

module.exports = {
  updateLastRestart,
  getLastRestart,
}
