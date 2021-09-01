const { ApplicationError } = require('../util/customErrors')
const { ADMINS } = require('../util/config')
const { User } = require('../models')

const isSuperAdmin = (username) => ADMINS.includes(username)

const fetchUserDataFromLoginAsForHeaders = async (headers) => {
  if (!isSuperAdmin(headers.uid)) return headers

  const loggedInAs = headers['x-admin-logged-in-as']
  if (!loggedInAs) return headers

  const newHeaders = { ...headers }
  const user = await User.findOne({ where: { id: loggedInAs } })

  if (!user) return headers
  newHeaders.preferredlanguage = user.language
  newHeaders.hypersonsisuid = user.id
  return newHeaders
}

const upsertUser = async ({ preferredlanguage, hypersonsisuid }) => {
  const user = await User.findOne({
    where: {
      id: hypersonsisuid,
    },
  })
  if (!user) throw new ApplicationError('User not found', 404)

  if (user.language !== preferredlanguage) {
    user.language = preferredlanguage

    await user.save()
  }

  return user
}

const currentUserMiddleware = async (req, _, next) => {
  const { uid: username } = req.headers
  if (!username) throw new ApplicationError('Missing uid header', 403)

  req.headers = await fetchUserDataFromLoginAsForHeaders(req.headers)

  req.user = await upsertUser(req.headers)
  req.isAdmin = isSuperAdmin(req.user.username)
  return next()
}

module.exports = currentUserMiddleware
