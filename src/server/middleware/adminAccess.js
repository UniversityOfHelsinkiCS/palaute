const { ADMINS } = require('../util/config')
const { ApplicationError } = require('../util/customErrors')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers

  if (!ADMINS.includes(username)) ApplicationError.Forbidden()

  return next()
}

module.exports = { adminAccess }
