const { ApplicationError } = require('../util/customErrors')
const logger = require('../util/logger')
const { ADMINS } = require('../util/config')
const { User } = require('../models')

const isSuperAdmin = (username) => ADMINS.includes(username)

const upsertUser = async ({
  uid,
  givenname,
  sn,
  mail,
  preferredlanguage,
  hypersonsisuid,
}) => {
  const [user] = await User.upsert({
    id: hypersonsisuid,
    first_name: givenname,
    last_name: sn,
    email: mail,
    language: preferredlanguage,
    username: uid,
  })

  return user
}

const currentUserMiddleware = async (req, res, next) => {
  const { uid: username } = req.headers
  if (!username) throw new ApplicationError('Missing uid header', 403)

  req.user = await upsertUser(req.headers)
  if (!isSuperAdmin(username)) return next()

  const loggedInAs = req.headers['x-admin-logged-in-as']
  if (!loggedInAs) return next()

  req.user = await User.findOne({ where: { id: loggedInAs } })
  return next()
}

module.exports = currentUserMiddleware
