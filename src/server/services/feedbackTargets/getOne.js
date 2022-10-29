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

const getFromDb = async (id) => {
  const fbt = await FeedbackTarget.findByPk(id, {
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
      fbt.dataValues.userFeedbackTargets
        .filter((ufbt) => ufbt.accessStatus === 'TEACHER')
        .map((ufbt) => ufbt.user),
      [['lastName', 'asc']],
    ),
  )
  fbt.set(
    'studentCount',
    fbt.dataValues.userFeedbackTargets.filter(
      (ufbt) => ufbt.accessStatus === 'STUDENT',
    ).length,
  )
  fbt.set(
    'feedbackCount',
    fbt.dataValues.userFeedbackTargets.filter((ufbt) => ufbt.feedbackId).length,
  )

  return fbt
}

const getUserFeedbackTarget = (userId, feedbackTargetId) =>
  UserFeedbackTarget.findOne({
    where: { userId, feedbackTargetId },
    include: { model: Feedback, as: 'feedback' },
  })

const getOne = async (id, user, isAdmin) => {
  const [feedbackTarget, userFeedbackTarget] = await Promise.all([
    getFromDb(id),
    getUserFeedbackTarget(user.id, id),
  ])

  if (!feedbackTarget) {
    throw new ApplicationError('Not found', 404)
  }

  let accessStatus = isAdmin ? 'ADMIN' : userFeedbackTarget?.accessStatus

  if (!userFeedbackTarget && !isAdmin) {
    // User not directly associated. Lets check if they have access through organisation
    const hasOrganisationAccess = (
      await user.getOrganisationAccessByCourseUnitId(
        feedbackTarget.courseUnitId,
      )
    )?.read

    if (!hasOrganisationAccess) {
      throw new ApplicationError('No enrolment', 403)
    }

    accessStatus = 'ORGANISATION'
  }

  const studentListVisible =
    await feedbackTarget.courseUnit.isStudentListVisible(isAdmin)

  const publicTarget = await feedbackTarget.toPublicObject(true)

  const responseReady = {
    ...publicTarget,
    accessStatus,
    feedback: userFeedbackTarget?.feedback ?? null,
  }

  return { ...responseReady, studentListVisible }
}

module.exports = { getOne }
