const { STUDENT_LIST_BY_COURSE_ENABLED, STUDENT_LIST_BY_COURSE_ENABLED_FOR_ADMIN } = require('../../../config')
const { sequelize } = require('../../db/dbConnection')
const { UserFeedbackTarget, User, Feedback, CourseUnit } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const logger = require('../../util/logger')
const { getAccess } = require('./getAccess')
const { getFeedbackTarget } = require('./util')

const getStudentListVisibility = async (courseUnitId, isAdmin) => {
  const organisationRows = await sequelize.query(
    'SELECT O.* from organisations O, course_units_organisations C ' +
      " WHERE C.course_unit_id = :cuId AND O.id = C.organisation_id AND c.type = 'PRIMARY'",
    {
      replacements: {
        cuId: courseUnitId,
      },
    }
  )

  if (organisationRows.length === 0) {
    logger.error('NO PRIMARY ORGANISATION FOR COURSE', { courseUnitId })
    return false
  }

  if (!organisationRows[0].length) return false

  const {
    code,
    student_list_visible: studentListVisible,
    student_list_visible_course_codes: studentListVisibleCourseCodes,
  } = organisationRows[0][0]

  if (
    STUDENT_LIST_BY_COURSE_ENABLED.includes(code) ||
    (STUDENT_LIST_BY_COURSE_ENABLED_FOR_ADMIN.includes(code) && isAdmin)
  ) {
    const { courseCode } = await CourseUnit.findByPk(courseUnitId, {
      attributes: ['courseCode'],
    })

    if (studentListVisibleCourseCodes.includes(courseCode)) return true
  }

  return studentListVisible ?? false
}

const getStudents = async ({ feedbackTargetId, user, isAdmin }) => {
  const feedbackTarget = await getFeedbackTarget({ feedbackTargetId, user })
  if (!feedbackTarget) ApplicationError.NotFound()

  const access = await getAccess({
    userFeedbackTarget: feedbackTarget.userFeedbackTargets[0],
    feedbackTarget,
    user,
    isAdmin,
  })

  if (!access?.canSeeStudents()) {
    ApplicationError.Forbidden()
  }

  const studentListVisible = await getStudentListVisibility(feedbackTarget.courseUnitId, isAdmin)

  if (!studentListVisible) {
    return []
  }

  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
    include: [
      {
        model: User,
        as: 'user',
      },
      {
        model: Feedback,
        as: 'feedback',
      },
    ],
  })

  const users = studentFeedbackTargets.map(target => ({
    ...target.user.dataValues,
    feedbackGiven: Boolean(target.feedback),
  }))

  if (users.filter(u => u.feedbackGiven).length < 5) {
    return []
  }

  return users
}

module.exports = {
  getStudents,
}