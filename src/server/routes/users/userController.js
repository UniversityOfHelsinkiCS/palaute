const { Op } = require('sequelize')
const _ = require('lodash')

const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')
const { User, Banner } = require('../../models')
const { ADMINS } = require('../../../config')
const { getUserIams } = require('../../util/jami')
const { getLastRestart } = require('../../util/lastRestart')

const login = async (req, res) => {
  const { user, isAdmin, loginAs } = req
  const iamGroups = req.noad ? [] : req.iamGroups ?? []

  if (!loginAs) {
    user.lastLoggedIn = new Date()
    await user.save()
  }

  const lastRestart = await getLastRestart()
  const banners = await Banner.getForUser(user)

  const isTeacher = !!user.employeeNumber

  return res.send({
    ...user.toJSON(),
    isTeacher,
    iamGroups,
    isAdmin,
    lastRestart,
    banners,
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
  const iamGroups = await getUserIams(id)
  const access = _.sortBy(await user.getOrganisationAccess(), access => access.organisation.code)

  return res.send({
    ...user.dataValues,
    iamGroups,
    access,
  })
}

const getAllUserAccess = async (req, res) => {
  if (!ADMINS.includes(req.user.username)) throw new ApplicationError('Forbidden', 403)

  const users = await User.findAll({
    where: {
      iamGroups: {
        [Op.ne]: [],
      },
    },
  })

  const usersWithAccess = []
  for (const user of users) {
    const access = _.sortBy(await user.getOrganisationAccess(), access => access.organisation.code)

    // eslint-disable-next-line no-continue
    if (!access.length) continue

    usersWithAccess.push({
      ...user.dataValues,
      iamGroups: user.iamGroups,
      access,
    })
  }

  return res.send(usersWithAccess)
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
router.get('/users/access', getAllUserAccess)
router.get('/users/:id', getUserDetails)

module.exports = router
