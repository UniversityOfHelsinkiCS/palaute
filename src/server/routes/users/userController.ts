import { InferAttributes, Op, WhereOptions } from 'sequelize'
import _ from 'lodash'
import { Response, Router } from 'express'

import { ApplicationError } from '../../util/ApplicationError'
import { User } from '../../models'
import { AuthenticatedRequest } from '../../types'
import { userCache } from '../../services/users/cache'
import { getUserIams } from '../../util/jami'
import { getLastRestart } from '../../util/lastRestart'
import { getUserPreferences, updateFeedbackCorrespondent } from '../../services/users'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'
import { getBannersForUser } from '../../services/banners/getForUser'

const router = Router()

router.get('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { user, loginAs } = req
  const iamGroups = req.noad ? [] : (req.user.iamGroups ?? [])

  if (!loginAs) {
    await User.upsert({ ...user.dataValues, lastLoggedIn: new Date() })

    if (user.isEmployee) {
      await updateFeedbackCorrespondent(user)
    }
  }

  const [lastRestart, banners, organisations, preferences] = await Promise.all([
    getLastRestart(),
    getBannersForUser(user),
    getUserOrganisationAccess(user),
    getUserPreferences(user),
    user.isTeacher(),
  ])

  res.send({
    ...user.toJSON(),
    serverVersion: process.env.VERSION || 'unknown',
    iamGroups,
    lastRestart,
    banners,
    organisations,
    preferences,
  })
})

// This is currently used in OrganisationSurveyEditor and FeedbackCorrespondent.
// In both cases users should be limited to HY employees,
// so only the users that belong to 'hy-employees' IAM group are returned.
// If getUser is laer needed in some new feature, this filtering can be made conditional.
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  const userQuery = req.query.user
  if (!userQuery || typeof userQuery !== 'string' || userQuery.length < 3) {
    res.send({
      params: {},
      persons: [],
    })
    return
  }

  let params = {}
  let where: WhereOptions<InferAttributes<User>> = {}

  const isFullName = userQuery.split(' ').length === 2
  const isEmail = userQuery.includes('.') || userQuery.includes('@')

  if (isFullName) {
    const [firstName, lastName] = userQuery.split(' ')
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
    params = { email: userQuery }

    where = {
      email: { [Op.iLike]: `${userQuery}%` },
    }
  } else {
    where = {
      [Op.or]: {
        firstName: {
          [Op.iLike]: `%${userQuery}%`,
        },
        lastName: {
          [Op.iLike]: `%${userQuery}%`,
        },
        email: {
          [Op.ne]: null,
        },
      },
    }
  }

  const persons = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'email', 'secondaryEmail', 'studentNumber'],
    where: {
      ...where,
    },
    limit: 10,
  })

  // Filter to 'hy-employees'
  const employees = []

  for (const person of persons) {
    const iamGroups = await getUserIams(person.id)
    if (iamGroups.includes('hy-employees')) {
      employees.push(person)
    }
  }

  res.send({
    params,
    persons: employees,
  })
})

router.get('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  if (id !== req.user.id && !req.user.isAdmin && !req.user.mockedBy?.isAdmin) {
    throw ApplicationError.Forbidden('Non-admin can only view own user details')
  }

  const user = await User.findByPk(id)
  const iamGroups = await getUserIams(id)

  user.iamGroups = iamGroups
  const access = _.sortBy(await getUserOrganisationAccess(user), oa => oa.organisation.code)

  res.send({
    ...user.dataValues,
    iamGroups,
    access,
  })
})

router.get('/logout', async (req: AuthenticatedRequest, res: Response) => {
  if (req.headers.uid) {
    userCache.invalidate(req.headers.uid as string)
  }

  const {
    headers: { shib_logout_url: shibLogoutUrl },
  } = req

  res.send({
    url: shibLogoutUrl,
  })
})

export { router }
