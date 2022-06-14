const { Op } = require('sequelize')

const { ApplicationError } = require('../util/customErrors')
const { User } = require('../models')
const { ADMINS } = require('../../config')

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

const getUserDetails = async (req, res) => {
  const { id } = req.params
  if (id !== req.user.id && !ADMINS.includes(req.user.username)) {
    throw new ApplicationError('Non-admin can only view own user details', 403)
  }
  const user = await User.findByPk(id)
  const access = await user.getOrganisationAccess()
  return res.send({
    ...user.dataValues,
    iamGroups: user.iamGroups,
    access,
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
  getUserDetails,
  getUser,
  getUserByEmail,
  logout,
}
