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
          [Op.in]: summaries.map((cur) => cur.feedbackTargetId),
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

  const results = summaries.map((cur) => {
    const results = cur.questionDistribution
      .map((questionData, idx) => {
        const question = questions.find((q) => q.id === cur.questionIds[idx])
        if (!question) return undefined
        const distribution = _.mapValues(questionData, Number)
        return {
          questionId: cur.questionIds[idx],
          mean: getMean(distribution, question),
          distribution,
        }
      })
      .filter(Boolean)

    const teachers =
      teacherData[cur.feedbackTargetId]?.map((teacher) => teacher.user) ?? []

    const teachingLanguages = (cur.teachingLanguages || []).map(
      (lang) => languages[lang]?.name,
    )

    return {
      ...cur,
      courseCode,
      results,
      teachingLanguages,
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
