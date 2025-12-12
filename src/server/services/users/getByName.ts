import { User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { NO_USER_USERNAME } from '../../util/config'
import { userCache } from './cache'

export const getByUsername = async (username: string) => {
  let user = await userCache.get(username)

  if (!user || user.username === NO_USER_USERNAME) {
    user = await User.findOne({
      where: { username },
    })

    if (!user) {
      user = await User.findOne({
        where: { username: NO_USER_USERNAME },
      })
      if (!user) {
        throw ApplicationError.NotFound(`User with username ${username} not found`)
      }
    }
    userCache.set(username, user.toJSON())
  }

  return user
}
