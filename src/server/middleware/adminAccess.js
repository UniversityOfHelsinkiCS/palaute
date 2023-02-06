const config = require('config')
const { ApplicationError } = require('../util/customErrors')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers

  if (!config.get('ADMINS')?.includes(username)) ApplicationError.Forbidden()

  return next()
}

module.exports = { adminAccess }
