import { User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { logger } from '../../util/logger'
import { userCache } from './cache'

// Prefix for users that are not in Sisu and were created by Norppa on login
const NORPPA_USER_ID_PREFIX = 'norppa-'

const findUser = async (username: string) => {
  const users = await User.findAll({
    where: { username },
  })

  // If the user has later been added from Sisu, prefer that row over the one created by Norppa
  return users.find(user => !user.id.startsWith(NORPPA_USER_ID_PREFIX)) ?? users[0] ?? null
}

const createNorppaUser = async (username: string) => {
  // findOrCreate returns the existing row if a concurrent request already created it
  const [user, created] = await User.findOrCreate({
    where: { id: `${NORPPA_USER_ID_PREFIX}${username}` },
    defaults: { id: `${NORPPA_USER_ID_PREFIX}${username}`, username },
  })

  if (created) logger.info(`Created user ${user.id}`)

  return user
}

export const getByUsername = async (username: string, { createIfMissing = false } = {}) => {
  let user = await userCache.get(username)

  if (!user) {
    user = await findUser(username)

    if (!user && createIfMissing) {
      user = await createNorppaUser(username)
    }

    if (!user) {
      throw ApplicationError.NotFound(`User with username ${username} not found`)
    }
    userCache.set(username, user.toJSON())
  }

  return user
}
