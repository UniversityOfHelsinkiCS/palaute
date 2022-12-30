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
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const cache = require('./cache')
const { getAccess } = require('./getAccess')

/**
 * Expensive data of feedback targets is cached:
 * - courseUnit
 * - organisation
 * - courseRealisation
 * - studentCount
 * - surveys
 * - responsibleTeachers
 * - studentListVisible
 * @param {number} id
 * @returns {object}
 */
const getFromDb = async (id) => {
  const fbt = await FeedbackTarget.findByPk(id, {
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
    ],
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
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
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        include: {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'hash'],
        },
      },
    ],
  })

  fbt.set(
    'responsibleTeachers',
    _.orderBy(
      fbt.userFeedbackTargets
        .filter((ufbt) => ufbt.accessStatus === 'RESPONSIBLE_TEACHER')
        .map((ufbt) => ufbt.user),
    ),
    [['lastName', 'desc']],
  )
  fbt.set(
    'teachers',
    _.orderBy(
      fbt.userFeedbackTargets
        .filter((ufbt) => ufbt.accessStatus === 'TEACHER')
        .map((ufbt) => ufbt.user),
    ),
    [['lastName', 'desc']],
  )
  fbt.set(
    'studentCount',
    fbt.userFeedbackTargets.filter((ufbt) => ufbt.accessStatus === 'STUDENT')
      .length,
  )

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

const getAdditionalDataFromCacheOrDb = async (id) => {
  let data = cache.get(id)
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

const getFeedbackTarget = (feedbackTargetId) =>
  FeedbackTarget.findByPk(feedbackTargetId, {
    attributes: {
      /* These we get from cache */ exclude: [
        'studentCount',
        'publicQuestionIds',
      ],
    },
    include: [{ model: CourseRealisation, as: 'courseRealisation' }],
  })

const getOneForUser = async (id, user, isAdmin) => {
  const [additionalData, userFeedbackTarget, feedbackTarget] =
    await Promise.all([
      getAdditionalDataFromCacheOrDb(id),
      getUserFeedbackTarget(user.id, id),
      getFeedbackTarget(id),
    ])

  if (!feedbackTarget) {
    throw new ApplicationError('Not found', 404)
  }

  const access = await getAccess(
    userFeedbackTarget,
    user,
    feedbackTarget,
    isAdmin,
  )
  if (!access) {
    throw new ApplicationError('No access', 403)
  }

  return {
    ...additionalData,
    accessStatus: access,
    feedback: userFeedbackTarget?.feedback ?? null,
    ...feedbackTarget.toJSON(),
  }
}

module.exports = { getOneForUser, getAdditionalDataFromCacheOrDb }
