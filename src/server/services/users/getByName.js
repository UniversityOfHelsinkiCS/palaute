const { User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const cache = require('./cache')

const getByUsername = async username => {
  let user = await cache.get(username)

  if (!user) {
    user = await User.findOne({
      where: { username },
    })

    if (!user) {
      throw new ApplicationError(`User with username ${username} not found`, 404)
    }
    cache.set(username, user.toJSON())
  }

  return user
}

module.exports = { getByUsername }
