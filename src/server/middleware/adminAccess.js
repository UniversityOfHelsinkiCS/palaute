const { ApplicationError } = require('../util/customErrors')

// This middleware checks if the user is an admin and throws an error if not.
const adminAccess = (req, _, next) => {
  if (!req.user.isAdmin) ApplicationError.Forbidden()

  return next()
}

module.exports = { adminAccess }
