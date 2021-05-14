const { User } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const userHandler = async (users) => {
  await users.reduce(async (promise, user) => {
    await promise
    try {
      if (!user.id) return
      const firstName = user.firstNames ? user.firstNames.split(' ')[0] : null
      const { lastName, id, studentNumber } = user
      const username = user.eduPersonPrincipalName
        ? user.eduPersonPrincipalName.split('@')[0]
        : user.id

      await User.upsert({
        id,
        username,
        firstName,
        lastName,
        studentNumber,
      })
    } catch (err) {
      logger.info('ERR', err, user)
    }
  }, Promise.resolve())
}

const updateUsers = async () => {
  await mangleData('persons', 3000, userHandler)
}

module.exports = updateUsers
