const { Op } = require('sequelize')
const _ = require('lodash')

const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')
const { User } = require('../../models')
const { ADMINS } = require('../../../config')
const { relevantIAMs } = require('../../../config/IAMConfig')

const login = async (req, res) => {
  const { user, isAdmin } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const allIamGroups = req.noad ? [] : req.iamGroups ?? []
  const relevantIamGroups = allIamGroups.filter((iam) =>
    relevantIAMs.includes(iam),
  )
  user.iamGroups = relevantIamGroups
  user.lastLoggedIn = new Date()
  await user.save()

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
  const access = _.sortBy(
    await user.getOrganisationAccess(),
    (access) => access.organisation.code,
  )
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

const router = Router()

router.get('/login', login)
router.get('/logout', logout)
router.get('/users', getUserByEmail)
router.get('/users/:id', getUserDetails)

module.exports = router
