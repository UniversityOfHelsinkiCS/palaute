const { User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { NO_USER_USERNAME } = require('../../util/config')
const cache = require('./cache')

const getByUsername = async username => {
  let user = await cache.get(username)

  if (!user) {
    user = await User.findOne({
      where: { username },
    })

    if (!user) {
      user = await User.findOne({
        where: { username: NO_USER_USERNAME },
      })
      if (!user) {
        throw new ApplicationError(`User with username ${username} not found`, 404)
      }
    }
    cache.set(username, user.toJSON())
  }

  return user
}

module.exports = { getByUsername }
