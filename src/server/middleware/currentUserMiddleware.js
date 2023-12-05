const jwt = require('jsonwebtoken')
const { ApplicationError } = require('../util/customErrors')
const { JWT_KEY } = require('../util/config')
const { User } = require('../models')
const logger = require('../util/logger')
const { getUserByUsername } = require('../services/users')
const { getUserIams } = require('../util/jami')

const getLoggedInAsUser = async (user, loggedInAsUserId) => {
  if (!user.isAdmin) return undefined

  const loggedInAsUser = await User.findByPk(loggedInAsUserId)
  loggedInAsUser.iamGroups = await getUserIams(loggedInAsUserId)
  await loggedInAsUser.populateAccess()

  return loggedInAsUser
}

const getUsernameFromToken = req => {
  const { token, tokenuser } = req.headers

  const { username } = jwt.verify(token, JWT_KEY)

  if (!username) {
    logger.info('Token broken', { token })
    logger.info('Token user', { tokenuser })
    throw new ApplicationError('Token is missing username', 403)
  }

  return username
}

const getUsernameFromShibboHeaders = req => {
  const { uid: username } = req.headers

  if (!username) throw new ApplicationError('Missing uid header', 403)

  return username
}

const currentUserMiddleware = async (req, _, next) => {
  const isNoAdPath = req.path.startsWith('/noad')
  req.noad = isNoAdPath

  const username = isNoAdPath ? await getUsernameFromToken(req) : getUsernameFromShibboHeaders(req)

  req.user = await getUserByUsername(username)

  req.user.iamGroups = req.iamGroups
  await req.user.populateAccess()

  if (req.headers['x-admin-logged-in-as']) {
    const loggedInAsUser = await getLoggedInAsUser(req.user, req.headers['x-admin-logged-in-as'])
    if (loggedInAsUser) {
      req.user = loggedInAsUser
      req.loginAs = true
    }
  }

  return next()
}

module.exports = currentUserMiddleware
