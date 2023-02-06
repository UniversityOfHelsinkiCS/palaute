const jwt = require('jsonwebtoken')
const config = require('config')
const { ApplicationError } = require('../util/customErrors')
const { JWT_KEY } = require('../util/config')
const { User } = require('../models')
const logger = require('../util/logger')
const { getUserByUsername } = require('../services/users')

const isSuperAdmin = username => config.get('ADMINS')?.includes(username)

const getTestUser = async () => {
  let testUser = await User.findByPk('abc1234')
  if (testUser) return testUser
  testUser = await User.create({
    id: 'abc1234',
    username: 'ohj_tosk',
    email: 'grp-toska@helsinki.fi',
    studentNumber: '092345321',
    employeeNumber: '99999a9',
    firstName: 'Gert',
    lastName: 'Adamson',
  })

  return testUser
}

const getLoggedInAsUser = async (actualUser, loggedInAsUser) => {
  if (!isSuperAdmin(actualUser)) return undefined

  const user = await User.findByPk(loggedInAsUser)

  return user
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

  if (username === 'ohj_tosk') {
    req.user = await getTestUser()
  } else {
    req.user = await getUserByUsername(username)
  }

  if (req.headers['x-admin-logged-in-as']) {
    const loggedInAsUser = await getLoggedInAsUser(username, req.headers['x-admin-logged-in-as'])
    if (loggedInAsUser) {
      req.user = loggedInAsUser
      req.loginAs = true
    }
  }

  req.isAdmin = isNoAdPath ? false : isSuperAdmin(req.user.username)
  req.user.isAdmin = req.isAdmin

  return next()
}

module.exports = currentUserMiddleware
