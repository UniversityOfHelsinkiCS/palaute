const jwt = require('jsonwebtoken')
const { ApplicationError } = require('../util/customErrors')
const { JWT_KEY } = require('../util/config')
const { User } = require('../models')
const logger = require('../util/logger')
const { getUserByUsername } = require('../services/users')
const { getUserIams } = require('../util/jami')

const getLoggedInAsUser = async loggedInAsUserId => {
  const loggedInAsUser = await User.findByPk(loggedInAsUserId)
  loggedInAsUser.iamGroups = await getUserIams(loggedInAsUserId)
  await loggedInAsUser.populateAccess()

  return loggedInAsUser
}

const setLoggedInAsUser = async req => {
  const loggedInAsUser = await getLoggedInAsUser(req.headers['x-admin-logged-in-as'])
  if (loggedInAsUser) {
    const originalUser = req.user
    req.user = loggedInAsUser
    req.user.mockedBy = originalUser.username
    req.loginAs = true
  }
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

const isAdminLoginAs = req => req.user.isAdmin && req.headers['x-admin-logged-in-as']

const currentUserMiddleware = async (req, _, next) => {
  const isNoAdPath = req.path.startsWith('/noad')
  req.noad = isNoAdPath

  const username = isNoAdPath ? getUsernameFromToken(req) : getUsernameFromShibboHeaders(req)

  req.user = await getUserByUsername(username)

  req.user.iamGroups = req.iamGroups
  await req.user.populateAccess()

  if (isAdminLoginAs(req)) {
    await setLoggedInAsUser(req)
  }

  return next()
}

module.exports = currentUserMiddleware
