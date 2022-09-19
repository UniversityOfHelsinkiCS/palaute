const { ADMINS } = require('../../config')
const { ApplicationError } = require('../util/customErrors')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers

  if (!ADMINS.includes(username)) throw new ApplicationError('Forbidden', 403)

  return next()
}

module.exports = { adminAccess }
