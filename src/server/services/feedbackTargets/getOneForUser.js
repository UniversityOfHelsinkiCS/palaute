const _ = require('lodash')
const {
  FeedbackTarget,
  CourseUnit,
  Organisation,
  CourseRealisation,
  UserFeedbackTarget,
  Feedback,
  User,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const cache = require('./cache')

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
      { model: CourseRealisation, as: 'courseRealisation' },
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

  const feedbackTargetJson = {
    ...publicTarget,
    studentListVisible,
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

  let accessStatus = isAdmin ? 'ADMIN' : userFeedbackTarget?.accessStatus

  if (!userFeedbackTarget && !isAdmin) {
    // User not directly associated. Lets check if they have access through organisation
    const hasOrganisationAccess = (
      await user.getOrganisationAccessByCourseUnitId(
        additionalData.courseUnitId,
      )
    )?.read

    if (!hasOrganisationAccess) {
      throw new ApplicationError('No enrolment', 403)
    }

    accessStatus = 'ORGANISATION'
  }

  return {
    ...additionalData,
    accessStatus,
    feedback: userFeedbackTarget?.feedback ?? null,
    ...feedbackTarget.toJSON(),
  }
}

module.exports = { getOneForUser, getAdditionalDataFromCacheOrDb }
