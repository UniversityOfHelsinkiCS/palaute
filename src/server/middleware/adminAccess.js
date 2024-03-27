const { ApplicationError } = require('../util/customErrors')

const adminAccess = (req, _, next) => {
  if (!req.user.isAdmin) ApplicationError.Forbidden()

  return next()
}

module.exports = { adminAccess }
