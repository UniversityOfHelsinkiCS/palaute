/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const logger = require('../util/logger')
const { User } = require('../models')
const importerClient = require('../util/importerClient')

const getUserList = async (limit, offset) => {
  const { data } = await importerClient.get('/palaute/updater/persons', {
    params: { limit, offset },
  })
  return data
}

const updateUsers = async () => {
  logger.info('Starting to update users')
  const limit = 3000
  let offset = 0
  let sum = 0
  let count = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const start = new Date()
    const users = await getUserList(limit, offset)
    if (users.length === 0) break

    await users.reduce(async (promise, user) => {
      await promise
      if (!user.id || !user.studentNumber || !user.eduPersonPrincipalName)
        return
      const firstName = user.firstNames.split(' ')[0]
      const { lastName, id, studentNumber } = user
      const username = user.eduPersonPrincipalName.split('@')[0]
      await User.upsert({
        id,
        username,
        firstName,
        lastName,
        studentNumber,
      })
    }, Promise.resolve())
    const timePerUser = (new Date() - start) / users.length
    count++
    sum += timePerUser
    logger.info(
      `Updated ${
        users.length
      } users, offset ${offset} time per user ${timePerUser.toFixed(4)}ms`,
    )
    offset += limit
    logger.info(`average ${(sum / count).toFixed(4)}ms`)
  }
}

module.exports = updateUsers
