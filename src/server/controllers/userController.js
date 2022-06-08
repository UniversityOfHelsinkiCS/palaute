const { Op } = require('sequelize')

const { ApplicationError } = require('../util/customErrors')
const { User } = require('../models')

const getUser = async (req, res) => {
  const { user, isAdmin } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const isTeacher = !!user.employeeNumber

  return res.send({
    ...user.toJSON(),
    isTeacher,
    iamGroups: user.iamGroups ?? [],
    isAdmin,
  })
}

const getUserByEmail = async (req, res) => {
  const {
    query: { email },
  } = req

  const params = { email }

  const persons = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'email', 'secondaryEmail'],
    where: {
      [Op.or]: {
        email: { [Op.iLike]: `${email}%` },
        secondaryEmail: { [Op.iLike]: `${email}%` },
      },
    },
    limit: 10,
  })

  return res.send({
    params,
    persons,
  })
}

const logout = async (req, res) => {
  const {
    headers: { shib_logout_url: shibLogoutUrl },
  } = req

  return res.send({
    url: shibLogoutUrl,
  })
}

module.exports = {
  getUser,
  getUserByEmail,
  logout,
}
