const { ApplicationError } = require('../util/customErrors')
const { ADMINS } = require('../util/config')
const { User } = require('../models')

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
    where: {
      username,
    },
  })
  if (!user && username === 'ohj_tosk') return createTestUser()
  if (!user) {
    throw new ApplicationError(`User with username ${username} not found`, 404)
  }

  return user
}

const currentUserMiddleware = async (req, _, next) => {
  const { uid: username } = req.headers
  if (!username) throw new ApplicationError('Missing uid header', 403)

  req.user = await getUser(username)

  if (req.headers['x-admin-logged-in-as']) {
    const loggedInAsUser = await getLoggedInAsUser(
      username,
      req.headers['x-admin-logged-in-as'],
    )
    if (loggedInAsUser) req.user = loggedInAsUser
  }

  req.isAdmin = isSuperAdmin(req.user.username)

  return next()
}

module.exports = currentUserMiddleware
