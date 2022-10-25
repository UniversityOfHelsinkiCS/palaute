const jwt = require('jsonwebtoken')
const { ApplicationError } = require('../util/customErrors')
const { ADMINS, JWT_KEY } = require('../util/config')
const { relevantIAMs } = require('../../config/IAMConfig')
const { User } = require('../models')
const logger = require('../util/logger')

const isSuperAdmin = (username) => ADMINS.includes(username)

const createTestUser = async () => {
  const testUser = await User.create({
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

  const user = await User.findOne({ where: { id: loggedInAsUser } })

  return user
}

const getUser = async (username) => {
  const user = await User.findOne({
    where: { username },
  })
  if (!user && username === 'ohj_tosk') return createTestUser()
  if (!user) {
    throw new ApplicationError(`User with username ${username} not found`, 404)
  }

  return user
}

const getUsernameFromToken = (req) => {
  const { token, tokenuser } = req.headers

  try {
    const { username } = jwt.verify(token, JWT_KEY)

    if (!username) throw new ApplicationError('Token is missing username', 403)

    return username
  } catch (err) {
    logger.info('Token broken', { token })
    logger.info('Token user', { tokenuser })
    throw new ApplicationError('Access token was malformed', 500)
  }
}

const getUsernameFromShibboHeaders = (req) => {
  const { uid: username } = req.headers

  if (!username) throw new ApplicationError('Missing uid header', 403)

  return username
}

const currentUserMiddleware = async (req, _, next) => {
  const isNoAdPath = req.path.startsWith('/noad')

  const username = isNoAdPath
    ? await getUsernameFromToken(req)
    : getUsernameFromShibboHeaders(req)

  if (!username) throw new ApplicationError('Missing uid header', 403)

  req.user = await getUser(username)

  if (req.headers['x-admin-logged-in-as']) {
    const loggedInAsUser = await getLoggedInAsUser(
      username,
      req.headers['x-admin-logged-in-as'],
    )
    if (loggedInAsUser) req.user = loggedInAsUser
  } else if (req.path.includes('login')) {
    const iamGroups = isNoAdPath ? [] : req.iamGroups ?? []
    req.user.iamGroups = iamGroups.filter((iam) => relevantIAMs.includes(iam))
    req.user.lastLoggedIn = new Date()
    await req.user.save()
  }

  req.isAdmin = isNoAdPath ? false : isSuperAdmin(req.user.username)
  req.user.isAdmin = req.isAdmin

  return next()
}

module.exports = currentUserMiddleware
