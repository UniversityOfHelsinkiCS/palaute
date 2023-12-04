const { Op } = require('sequelize')
const _ = require('lodash')
const { Router } = require('express')

const { ApplicationError } = require('../../util/customErrors')
const { User, Banner } = require('../../models')
const cache = require('../../services/users/cache')
const { getUserIams } = require('../../util/jami')
const { getAllOrganisationAccess } = require('../../services/organisationAccess')
const { getLastRestart } = require('../../util/lastRestart')

const login = async (req, res) => {
  const { user, loginAs } = req
  const iamGroups = req.noad ? [] : req.user.iamGroups ?? []

  if (!loginAs) {
    await User.upsert({ ...user.dataValues, lastLoggedIn: new Date() })
  }

  const [lastRestart, banners, organisations] = await Promise.all([
    getLastRestart(),
    Banner.getForUser(user),
    user.getOrganisationAccess(),
  ])

  const isTeacher = !!user.employeeNumber

  return res.send({
    ...user.toJSON(),
    isTeacher,
    iamGroups,
    lastRestart,
    banners,
    organisations,
  })
}

const getUser = async (req, res) => {
  const {
    query: { user, isEmployee },
  } = req

  let params = {}
  let where = {}

  const isFullName = user.split(' ').length === 2
  const isEmail = user.includes('.') || user.includes('@')

  if (isFullName) {
    const [firstName, lastName] = user.split(' ')
    params = { firstName, lastName }
    where = {
      firstName: {
        [Op.iLike]: `%${firstName}%`,
      },
      lastName: {
        [Op.iLike]: `%${lastName}%`,
      },
      email: {
        [Op.ne]: null,
      },
    }
  } else if (isEmail) {
    params = { email: user }

    where = {
      email: { [Op.iLike]: `${user}%` },
    }
  } else {
    where[Op.or] = {
      firstName: {
        [Op.iLike]: `%${user}%`,
      },
      lastName: {
        [Op.iLike]: `%${user}%`,
      },
      email: {
        [Op.ne]: null,
      },
    }
  }

  const persons = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'email', 'secondaryEmail', 'studentNumber'],
    where: {
      ...where,
      ...(isEmployee ? { [Op.not]: { employeeNumber: null } } : {}),
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
  if (id !== req.user.id && !req.user.isAdmin) {
    throw new ApplicationError('Non-admin can only view own user details', 403)
  }

  const user = await User.findByPk(id)
  const iamGroups = await getUserIams(id)

  user.iamGroups = iamGroups
  const access = _.sortBy(await user.getOrganisationAccess(), access => access.organisation.code)

  return res.send({
    ...user.dataValues,
    iamGroups,
    access,
  })
}

const getAllUserAccess = async (req, res) => {
  if (!req.user.isAdmin) throw new ApplicationError('Forbidden', 403)

  const usersWithAccess = await getAllOrganisationAccess()

  return res.send(usersWithAccess)
}

const logout = async (req, res) => {
  if (req.headers.uid) {
    cache.invalidate(req.headers.uid)
  }

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
router.get('/users', getUser)
router.get('/users/access', getAllUserAccess)
router.get('/users/:id', getUserDetails)

module.exports = router
