import { sequelize } from '../../db/dbConnection'
import { UserFeedbackTarget, User, Feedback, CourseUnit } from '../../models'
import { ALWAYS_SHOW_STUDENT_LIST } from '../../util/config'
import { ApplicationError } from '../../util/ApplicationError'
import { logger } from '../../util/logger'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User as UserType } from '../../models/user'

const getStudentListVisibility = async (courseUnitId: string) => {
  const organisationRows = await sequelize.query(
    'SELECT O.* from organisations O, course_units_organisations C ' +
      " WHERE C.course_unit_id = :cuId AND O.id = C.organisation_id AND c.type = 'PRIMARY'",
    {
      replacements: {
        cuId: courseUnitId,
      },
    }
  )

  if (!organisationRows[0].length) {
    logger.error('NO PRIMARY ORGANISATION FOR COURSE', { courseUnitId })
    return false
  }

  const {
    student_list_visible: studentListVisible,
    student_list_visible_by_course: studentListVisibleByCourse,
    student_list_visible_course_codes: studentListVisibleCourseCodes,
  } = organisationRows[0][0] as any

  if (studentListVisibleByCourse) {
    const courseUnit = await CourseUnit.findByPk(courseUnitId, {
      attributes: ['courseCode'],
    })

    if (courseUnit && studentListVisibleCourseCodes.includes(courseUnit.courseCode)) return true
  }

  return studentListVisible ?? false
}

const getStudentsWithFeedbackStatus = async (feedbackTargetId: number) => {
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

interface GetStudentsParams {
  feedbackTargetId: number
  user: UserType
}

const getStudents = async ({ feedbackTargetId, user }: GetStudentsParams) => {
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
    access.canAlwaysSeeStudents()

  // Previous functionality to not show any student data if feedback given status is not shown
  if (!ALWAYS_SHOW_STUDENT_LIST && !showFeedbackGiven) return []

  if (showFeedbackGiven) return studentsWithFeedback

  const studentsWithoutFeedback = studentsWithFeedback.map(({ feedbackGiven, ...rest }) => rest)

  return studentsWithoutFeedback
}

export { getStudents }
