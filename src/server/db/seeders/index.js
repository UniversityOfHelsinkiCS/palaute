const logger = require('../../util/logger')
const { seedTestGroups } = require('./groupsTest')
const { seedTags } = require('./tags')

const seed = async () => {
  // eslint-disable-next-line no-promise-executor-return
  await new Promise(resolve => setTimeout(() => resolve(), 1_000))
  console.time('seed')
  try {
    await seedTags()
    await seedTestGroups()
  } catch (e) {
    logger.error('Seeding failed: ', e)
  }
  console.timeEnd('seed')
}

module.exports = { seed }
