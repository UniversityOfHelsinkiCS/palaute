const _ = require('lodash')
const { Op } = require('sequelize')

const { UserFeedbackTarget, User } = require('../../models')
const languages = require('../../util/languages.json')
const { runCourseRealisationSummaryQuery } = require('./sql')
const { getMean } = require('./utils')

const getCourseRealisationSummaries = async ({
  courseCode,
  questions,
  accessibleCourseRealisationIds,
  organisationAccess,
}) => {
  const allCuSummaries = await runCourseRealisationSummaryQuery(courseCode)

  const summaries = organisationAccess
    ? allCuSummaries
    : allCuSummaries.filter(cur => accessibleCourseRealisationIds.includes(cur.id))

  const teacherData = _.groupBy(
    await UserFeedbackTarget.findAll({
      where: {
        feedbackTargetId: {
          [Op.in]: summaries.map(cur => cur.feedbackTargetId),
        },
        accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
      },
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    }),
    teacher => teacher.feedbackTargetId
  )

  const results = summaries.map(cur => {
    const results = cur.questionDistribution
      .map((questionData, idx) => {
        const question = questions.find(q => q.id === cur.questionIds[idx])
        if (!question) return undefined
        const distribution = _.mapValues(questionData, Number)
        return {
          questionId: cur.questionIds[idx],
          mean: getMean(distribution, question),
          distribution,
        }
      })
      .filter(Boolean)

    const allTeachers = teacherData[cur.feedbackTargetId] || []

    const teachers = _.sortBy(
      allTeachers.filter(ufbt => ufbt.accessStatus === 'TEACHER').map(teacher => teacher.user),
      'lastName'
    )
    const responsibleTeachers = _.sortBy(
      allTeachers
        .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
        .map(teacher => teacher.user),
      'lastName'
    )
    const administrativePersons = _.sortBy(
      allTeachers.filter(ufbt => ufbt.isAdministrativePerson).map(teacher => teacher.user),
      'lastName'
    )

    const teachingLanguages = (cur.teachingLanguages || []).map(lang => languages[lang]?.name)

    return {
      ...cur,
      courseCode,
      results,
      teachingLanguages,
      teachers,
      responsibleTeachers,
      administrativePersons,
    }
  })

  const orderedResults = _.orderBy(results, ['startDate', 'feedbackCount'], ['desc', 'desc'])

  return orderedResults
}

module.exports = getCourseRealisationSummaries
