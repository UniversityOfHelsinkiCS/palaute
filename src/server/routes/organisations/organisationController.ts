import _ from 'lodash'
import { Response, Router } from 'express'
import { Op } from 'sequelize'
import { AuthenticatedRequest } from '../../types'
import { formatActivityPeriod } from '../../util/common'
import { getOrganisationsList } from '../../services/organisations/getOrganisationsList'
import { ORGANISATION_SURVEYS_ENABLED } from '../../util/config'
import {
  Organisation,
  OrganisationLog,
  User,
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  Summary,
} from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { createOrganisationLog } from '../../services/auditLog'
import getOpenFeedbackByOrganisation from '../../services/organisations/getOpenFeedbackByOrganisation'
import { getAccessAndOrganisation } from './util'
import { router as feedbackCorrespondentRouter } from './feedbackCorrespondentController'
import { router as organisationSurveyRouter } from './organisationSurveyController'
import { getOrganisationData as getOrganisationDataFromJami } from '../../util/jami'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'

export const router = Router()

const getUpdatedCourseCodes = async (updatedCourseCodes: string[], organisation: Organisation) => {
  const organisationCourseCodes = await organisation.getCourseCodes()

  return _.uniq(updatedCourseCodes.filter(c => organisationCourseCodes.includes(c)))
}

const getOrganisations = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  if (!user.isAdmin && !user.isEmployee) {
    res.send([])
    return
  }

  const organisationAccess = await getUserOrganisationAccess(user)

  const organisations = organisationAccess.map(({ organisation, access }) => ({
    ...organisation.toJSON(),
    access,
  }))

  res.send(organisations)
}

const getOrganisationData = async (req: AuthenticatedRequest, res: Response) => {
  const data = await getOrganisationDataFromJami()

  res.send(data)
}

const getOrganisationsListHandler = async (req: AuthenticatedRequest, res: Response) => {
  const organisationsList = await getOrganisationsList()

  const openUniversity = {
    name: {
      en: 'Open University Studies',
      fi: 'Avoimen yliopiston opinnot',
      sv: 'Öppna universitetets studier',
    },
    code: 'H930',
  }

  if (!organisationsList.map(org => org.code).includes(openUniversity.code)) {
    organisationsList.push(openUniversity)
  }

  res.send(organisationsList)
}

const updateOrganisation = async (req: AuthenticatedRequest, res: Response) => {
  const { user, body } = req
  const { code } = req.params

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(user, code, { write: true })

  const updates = _.pick(body, [
    'studentListVisible',
    'studentListVisibleByCourse',
    'disabledCourseCodes',
    'studentListVisibleCourseCodes',
    'publicQuestionIds',
  ])

  if (!hasAdminAccess && (updates.disabledCourseCodes || updates.studentListVisibleCourseCodes)) {
    ApplicationError.Forbidden('Course codes can only be updated by organisation admins')
  }

  if (updates.disabledCourseCodes) {
    updates.disabledCourseCodes = await getUpdatedCourseCodes(updates.disabledCourseCodes, organisation)
  }

  if (updates.studentListVisibleCourseCodes) {
    updates.studentListVisibleCourseCodes = await getUpdatedCourseCodes(
      updates.studentListVisibleCourseCodes,
      organisation
    )
  }

  await createOrganisationLog(organisation, updates, user)

  Object.assign(organisation, updates)

  const updatedOrganisation = await organisation.save()

  res.send(updatedOrganisation)
}

const getOrganisationByCode = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params

  const { organisation, hasReadAccess, hasWriteAccess, hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    read: true,
  })

  const theOrganisation = await Organisation.findOne({
    where: {
      code,
    },
    include: [
      {
        model: User,
        as: 'users',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ],
  })

  const tags = _.orderBy(await theOrganisation.getTags(), tag => tag.name?.fi)

  const publicOrganisation = {
    ...organisation.toJSON(),
    tags,
    users: theOrganisation?.users ?? [],
    access: {
      read: hasReadAccess,
      write: hasWriteAccess,
      admin: hasAdminAccess,
    },
  }

  res.send(publicOrganisation)
}

const getOrganisationLogs = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params

  if (!user.isAdmin) {
    ApplicationError.Forbidden()
  }

  const { organisationLogs } = await Organisation.findOne({
    where: {
      code,
    },
    attributes: [],
    order: [[{ model: OrganisationLog, as: 'organisationLogs' }, 'createdAt', 'DESC']],
    include: {
      model: OrganisationLog,
      as: 'organisationLogs',
      attributes: ['data', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    },
  })

  res.send(organisationLogs)
}

const getOpenQuestionsByOrganisation = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params

  const organisationAccess = await getUserOrganisationAccess(user)

  const access = organisationAccess.filter(org => org.organisation.code === code)

  if (access.length === 0) {
    ApplicationError.Forbidden()
  }

  const codesWithIds = await getOpenFeedbackByOrganisation(code)

  res.send(codesWithIds)
}

router.get(
  '/:code/courses',
  async (
    req: AuthenticatedRequest<any, any, any, { search: string; startDate: string; endDate: string }>,
    res: Response
  ) => {
    const { user } = req
    const { code } = req.params

    const organisationAccess = await getUserOrganisationAccess(user)

    const { search } = req.query

    const access = organisationAccess.filter(org => org.organisation.code === code)

    if (access.length === 0) {
      ApplicationError.Forbidden()
    }

    const activityPeriod = formatActivityPeriod(req.query)

    const courseUnits = await CourseUnit.findAll({
      include: [
        {
          model: FeedbackTarget,
          as: 'feedbackTargets',
          attributes: ['id', 'courseRealisationId'],
          where: { userCreated: false },
          include: [
            {
              model: CourseRealisation,
              as: 'courseRealisation',
              attributes: ['id', 'name', 'startDate', 'endDate'],
              where: {
                ...(activityPeriod?.startDate &&
                  activityPeriod?.endDate && {
                    [Op.or]: [
                      {
                        startDate: {
                          [Op.between]: [activityPeriod.startDate, activityPeriod.endDate],
                        },
                      },
                      {
                        endDate: {
                          [Op.between]: [activityPeriod.startDate, activityPeriod.endDate],
                        },
                      },
                      {
                        startDate: {
                          [Op.lte]: activityPeriod.startDate,
                        },
                        endDate: {
                          [Op.gte]: activityPeriod.endDate,
                        },
                      },
                    ],
                  }),
              },
            },
            {
              model: Summary,
              as: 'summary',
            },
          ],
        },
        {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'code', 'name'],
          through: { as: 'courseUnitsOrganisations' },
          where: { code },
        },
      ],
      attributes: ['id', 'name', 'courseCode'],
      where: {
        [Op.or]: {
          courseCode: { [Op.iLike]: `${search}%` },
          [Op.or]: [
            { 'name.fi': { [Op.iLike]: `%${search}%` } },
            { 'name.sv': { [Op.iLike]: `%${search}%` } },
            { 'name.en': { [Op.iLike]: `%${search}%` } },
          ],
        },
      },
    })

    // Only send studentCount to frontend in fbt summary
    const courseUnitsWithFilteredSummary = courseUnits?.map(cu => {
      const plainCU = cu.get({ plain: true })

      return {
        ...plainCU,
        feedbackTargets: plainCU.feedbackTargets.map(fbt => ({
          ...fbt,
          summary: {
            data: {
              studentCount: fbt.summary?.data?.studentCount,
            },
          },
        })),
      }
    })

    res.send(courseUnitsWithFilteredSummary)
  }
)

if (ORGANISATION_SURVEYS_ENABLED) router.use('/', organisationSurveyRouter)
router.get('/', getOrganisations)
router.get('/data', getOrganisationData)
router.get('/list', getOrganisationsListHandler)
router.put('/:code', updateOrganisation)
router.get('/:code', getOrganisationByCode)
router.get('/:code/open', getOpenQuestionsByOrganisation)
router.get('/:code/logs', getOrganisationLogs)
router.use('/', feedbackCorrespondentRouter)
