const { ApplicationError } = require('../util/customErrors')

const getUser = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)
  const isTeacher =
    req.headers?.employeenumber !== null &&
    req.headers?.employeenumber !== undefined
  res.send({
    ...user.dataValues,
    isTeacher,
  })
}

const logout = async (req, res) => {
  const {
    headers: { shib_logout_url: shibLogoutUrl },
  } = req

  res.send({
    url: shibLogoutUrl,
  })
}

module.exports = {
  getUser,
  logout,
}
