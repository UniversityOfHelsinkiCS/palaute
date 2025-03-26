const _ = require('lodash')
const {
  FeedbackTarget,
  CourseUnit,
  Organisation,
  CourseRealisation,
  UserFeedbackTarget,
  Feedback,
  User,
  Tag,
  ContinuousFeedback,
  Group,
  Summary,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const cache = require('./feedbackTargetCache')
const { getAccess } = require('./getAccess')

const populateGroupInformation = feedbackTarget => {
  for (const group of feedbackTarget.groups ?? []) {
    const teachers = feedbackTarget.userFeedbackTargets.filter(
      ufbt => ufbt.groupIds?.includes(group.id) && ufbt.hasTeacherAccess()
    )
    group.set(
      'teachers',
      _.orderBy(
        teachers.map(ufbt => ufbt.user),
        'lastName'
      )
    )
    const students = feedbackTarget.userFeedbackTargets.filter(
      ufbt => ufbt.groupIds?.includes(group.id) && ufbt.hasStudentAccess()
    )
    group.set('studentCount', students.length)
  }
}

/**
 * Expensive data of feedback targets is cached:
 * - courseUnit
 * - organisations
 * - courseRealisation
 * - groups
 * - studentCount
 * - surveys
 * - responsibleTeachers
 * - studentListVisible
 * @param {number} id
 * @returns {Promise<object>}
 */
const getFromDb = async id => {
  const fbt = await FeedbackTarget.findByPk(id, {
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
      'userCreated',
    ],
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        separate: true,
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      },
      {
        model: Summary,
        as: 'summary',
      },
      {
        model: ContinuousFeedback,
        as: 'continuousFeedbacks',
        attributes: ['id'],
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'hash'],
            through: { attributes: [] },
          },
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        include: [
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'hash'],
            through: { attributes: [] },
          },
        ],
      },
      {
        model: Group,
        as: 'groups',
        required: false,
        separate: true,
      },
    ],
  })
  if (!fbt) ApplicationError.NotFound(`FeedbackTarget ${id} doesn't exist`)

  fbt.set(
    'administrativePersons',
    _.orderBy(
      fbt.userFeedbackTargets.filter(ufbt => ufbt.isAdministrativePerson).map(ufbt => ufbt.user),
      'lastName'
    )
  )
  fbt.set(
    'responsibleTeachers',
    _.orderBy(
      fbt.userFeedbackTargets
        .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
        .map(ufbt => ufbt.user),
      'lastName'
    )
  )
  fbt.set(
    'teachers',
    _.orderBy(
      fbt.userFeedbackTargets.filter(ufbt => ufbt.accessStatus === 'TEACHER').map(ufbt => ufbt.user),
      'lastName'
    )
  )
  fbt.set('continuousFeedbackCount', fbt.continuousFeedbacks.length)
  fbt.set('tags', _.uniqBy((fbt.courseUnit?.tags ?? []).concat(fbt.courseRealisation?.tags ?? []), 'id'))
  populateGroupInformation(fbt)

  const studentListVisible = await fbt.courseUnit.isStudentListVisible()
  const publicTarget = await fbt.toPublicObject()
  const feedbackCanBeGiven = await fbt.feedbackCanBeGiven()

  const feedbackTargetJson = {
    ...publicTarget,
    studentListVisible,
    feedbackCanBeGiven,
  }

  return feedbackTargetJson
}

const getAdditionalDataFromCacheOrDb = async id => {
  let data = await cache.get(id)
  if (!data) {
    data = await getFromDb(id)
    cache.set(data.id, data)
  }
  return data
}

const getUserFeedbackTarget = (userId, feedbackTargetId) =>
  UserFeedbackTarget.findOne({
    where: { userId, feedbackTargetId },
    include: [{ model: Feedback, as: 'feedback' }],
  })

const getFeedbackTarget = feedbackTargetId =>
  FeedbackTarget.findByPk(feedbackTargetId, {
    attributes: {
      /* These we get from cache */ exclude: ['studentCount', 'publicQuestionIds', 'continuousFeedbackCount'],
    },
    include: [{ model: CourseRealisation, as: 'courseRealisation' }],
  })

const getOneForUser = async (id, user) => {
  const [additionalData, userFeedbackTarget, feedbackTarget] = await Promise.all([
    getAdditionalDataFromCacheOrDb(id),
    getUserFeedbackTarget(user.id, id),
    getFeedbackTarget(id),
  ])

  if (!feedbackTarget) {
    throw new ApplicationError('Not found', 404)
  }

  const { accessStatus } = await getAccess({
    userFeedbackTarget,
    user,
    feedbackTarget,
  })

  if (accessStatus.includes('NONE')) {
    throw new ApplicationError('No access', 403)
  }

  return {
    ...additionalData,
    accessStatus,
    feedback: userFeedbackTarget?.feedback ?? null,
    groupIds: userFeedbackTarget?.groupIds ?? [],
    ...feedbackTarget.toJSON(),
  }
}

module.exports = { getOneForUser, getAdditionalDataFromCacheOrDb }
