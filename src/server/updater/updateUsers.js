const { User } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const userHandler = async (users) => {
  await users.reduce(async (promise, user) => {
    await promise
    try {
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
    } catch (err) {
      logger.info('ERR', err, 'User', user)
    }
  }, Promise.resolve())
}

const updateUsers = async () => {
  await mangleData('persons', 3000, userHandler)
}

module.exports = updateUsers
