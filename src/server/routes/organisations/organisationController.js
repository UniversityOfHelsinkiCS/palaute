const _ = require('lodash')
const { Router } = require('express')
const { Op } = require('sequelize')
const { formatActivityPeriod } = require('../../util/common')
const { getOrganisationsList } = require('../../services/organisations/getOrganisationsList')
const { ORGANISATION_SURVEYS_ENABLED } = require('../../util/config')
const {
  Organisation,
  OrganisationLog,
  User,
  CourseUnit,
  CourseRealisation,
  CourseUnitsOrganisation,
  FeedbackTarget,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { createOrganisationLog } = require('../../services/auditLog')
const getOpenFeedbackByOrganisation = require('./getOpenFeedbackByOrganisation')
const { getAccessAndOrganisation } = require('./util')
const feedbackCorrespondentRouter = require('./feedbackCorrespondentController')
const organisationSurveyRouter = require('./organisationSurveyController')
const { getOrganisationData: getOrganisationDataFromJami } = require('../../util/jami')

const getUpdatedCourseCodes = async (updatedCourseCodes, organisation) => {
  const organisationCourseCodes = await organisation.getCourseCodes()

  return _.uniq(updatedCourseCodes.filter(c => organisationCourseCodes.includes(c)))
}

const getOrganisations = async (req, res) => {
  const { user, headers, isAdmin } = req

  const isEmployee = Boolean(headers?.employeenumber)

  if (!isAdmin && !isEmployee) {
    return res.send([])
  }

  const organisationAccess = await user.getOrganisationAccess()

  const organisations = organisationAccess.map(({ organisation, access }) => ({
    ...organisation.toJSON(),
    access,
  }))

  return res.send(organisations)
}

const getOrganisationData = async (req, res) => {
  const data = await getOrganisationDataFromJami()

  return res.send(data)
}

const getOrganisationsListHandler = async (req, res) => {
  const organisationsList = await getOrganisationsList()

  return res.send(organisationsList)
}

const updateOrganisation = async (req, res) => {
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
    return ApplicationError.Forbidden('Course codes can only be updated by organisation admins')
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

  return res.send(updatedOrganisation)
}

const getOrganisationByCode = async (req, res) => {
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

  return res.send(publicOrganisation)
}

const getOrganisationLogs = async (req, res) => {
  const { user } = req
  const { code } = req.params

  if (!user.isAdmin) {
    return ApplicationError.Forbidden()
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
      include: {
        model: User,
        as: 'user',
      },
    },
  })

  return res.send(organisationLogs)
}

const getOpenQuestionsByOrganisation = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const access = organisationAccess.filter(org => org.organisation.code === code)

  if (access.length === 0) {
    return ApplicationError.Forbidden()
  }

  const codesWithIds = await getOpenFeedbackByOrganisation(code)

  return res.send(codesWithIds)
}

const findFeedbackTargets = async (req, res) => {
  const { user, query } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const { search } = query

  const access = organisationAccess.filter(org => org.organisation.code === code)

  if (access.length === 0) {
    return ApplicationError.Forbidden()
  }

  const activityPeriod = formatActivityPeriod(query)

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
        ],
      },
      {
        model: Organisation,
        as: 'organisations',
        attributes: ['id', 'code', 'name'],
        through: { model: CourseUnitsOrganisation },
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

  return res.send(courseUnits)
}

const router = Router()

router.get('/', getOrganisations)
router.get('/data', getOrganisationData)
router.get('/list', getOrganisationsListHandler)
router.put('/:code', updateOrganisation)
router.get('/:code', getOrganisationByCode)
router.get('/:code/open', getOpenQuestionsByOrganisation)
router.get('/:code/logs', getOrganisationLogs)
router.get('/:code/courses', findFeedbackTargets)
if (ORGANISATION_SURVEYS_ENABLED) router.use('/', organisationSurveyRouter)
router.use('/', feedbackCorrespondentRouter)

module.exports = router
