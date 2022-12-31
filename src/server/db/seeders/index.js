const logger = require('../../util/logger')
const { seedTags } = require('./tags')

const seed = async () => {
  // eslint-disable-next-line no-promise-executor-return
  await new Promise(resolve => setTimeout(() => resolve(), 1_000))
  console.time('seed')
  try {
    await seedTags()
  } catch (e) {
    logger.error('Seeding failed: ', e)
  }
  console.timeEnd('seed')
}

module.exports = { seed }
