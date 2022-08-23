const _ = require('lodash')
const { Op, QueryTypes } = require('sequelize')

const { sequelize } = require('../../util/dbConnection')
const { UserFeedbackTarget, User } = require('../../models')
const languages = require('../../util/languages.json')
const { COURSE_REALISATION_SUMMARY_QUERY } = require('./sql')
const { getMean } = require('./utils')

const getCourseRealisationSummaries = async ({ courseCode, questions }) => {
  const summaries = await sequelize.query(COURSE_REALISATION_SUMMARY_QUERY, {
    replacements: { courseCode },
    type: QueryTypes.SELECT,
  })

  const teacherData = _.groupBy(
    await UserFeedbackTarget.findAll({
      where: {
        feedbackTargetId: {
          [Op.in]: summaries.map((r) => r.feedback_target_id),
        },
        accessStatus: 'TEACHER',
      },
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    }),
    (teacher) => teacher.feedbackTargetId,
  )

  const results = summaries.map((row) => {
    const questionIds = row.question_ids

    const results = row.question_distribution.map((question, idx) => {
      const distribution = _.mapValues(question, Number)
      return {
        questionId: questionIds[idx],
        mean: getMean(
          distribution,
          questions.find((q) => q.id === questionIds[idx]),
        ),
        distribution,
      }
    })

    const teachers = teacherData[row.feedback_target_id].map(
      (teacher) => teacher.user,
    )

    const teachingLanguages = (row.teaching_languages || []).map(
      (lang) => languages[lang]?.name,
    )

    return {
      courseCode,
      id: row.course_realisation_id,
      name: row.name,
      feedbackTargetId: row.feedback_target_id,
      results,
      feedbackCount: row.feedback_count,
      studentCount: row.student_count,
      feedbackResponseGiven: row.feedback_response_given,
      teachingLanguages,
      startDate: row.start_date,
      endDate: row.end_date,
      closesAt: row.closes_at,
      teachers,
    }
  })
  const orderedResults = _.orderBy(
    results,
    ['startDate', 'feedbackCount'],
    ['desc', 'desc'],
  )
  // console.log(JSON.stringify(orderedResults, null, 2))

  return orderedResults
}

module.exports = getCourseRealisationSummaries
