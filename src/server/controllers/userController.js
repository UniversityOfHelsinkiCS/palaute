const { ApplicationError } = require('../util/customErrors')

const getUser = async (req, res) => {
  const { user, iamGroups } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const isTeacher = !!user.employeeNumber

  res.send({
    ...user.toJSON(),
    isTeacher,
    iamGroups: iamGroups ?? [],
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
