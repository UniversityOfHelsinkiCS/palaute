const { sequelize } = require('../../db/dbConnection')
const { UserFeedbackTarget, User, Feedback, CourseUnit } = require('../../models')
const { ALWAYS_SHOW_STUDENT_LIST } = require('../../util/config')
const { ApplicationError } = require('../../util/customErrors')
const { logger } = require('../../util/logger')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const getStudentListVisibility = async courseUnitId => {
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
    student_list_visible: studentListVisible,
    student_list_visible_by_course: studentListVisibleByCourse,
    student_list_visible_course_codes: studentListVisibleCourseCodes,
  } = organisationRows[0][0]

  if (studentListVisibleByCourse) {
    const { courseCode } = await CourseUnit.findByPk(courseUnitId, {
      attributes: ['courseCode'],
    })

    if (studentListVisibleCourseCodes.includes(courseCode)) return true
  }

  return studentListVisible ?? false
}

const getStudentsWithFeedbackStatus = async feedbackTargetId => {
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

  const students = studentFeedbackTargets.map(target => ({
    ...target.user.dataValues,
    feedbackGiven: Boolean(target.feedback),
  }))

  return students
}

const getStudents = async ({ feedbackTargetId, user }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canSeeStudents()) ApplicationError.Forbidden()

  const studentListVisible = await getStudentListVisibility(feedbackTarget.courseUnitId)

  const studentsWithFeedback = await getStudentsWithFeedbackStatus(feedbackTargetId)

  /**
   * Show feedback given status if:
   * - Showing feedback status is enabled for organisation
   * - Course is no longer open so that feedback status cannot change
   * - At least 5 students have given feedback
   * - Or the user is admin
   */
  const showFeedbackGiven =
    (studentListVisible && !feedbackTarget.isOpen() && studentsWithFeedback.filter(u => u.feedbackGiven).length >= 5) ||
    access.canSeeAllFeedbacks()

  // Previous functionality to not show any student data if feedback given status is not shown
  if (!ALWAYS_SHOW_STUDENT_LIST && !showFeedbackGiven) return []

  if (showFeedbackGiven) return studentsWithFeedback

  const studentsWithoutFeedback = studentsWithFeedback.map(({ feedbackGiven, ...rest }) => rest)

  return studentsWithoutFeedback
}

module.exports = {
  getStudents,
}
