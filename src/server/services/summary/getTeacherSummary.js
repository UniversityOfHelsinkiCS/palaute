const _ = require('lodash')
const { Op } = require('sequelize')
const {
  Organisation,
  Summary,
  CourseUnit,
  FeedbackTarget,
  UserFeedbackTarget,
  CourseRealisation,
} = require('../../models')
const { sumSummaries } = require('./utils')

const getTeacherSummary = async ({ startDate, endDate, user }) => {
  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    include: [
      {
        model: Summary.scope({ method: ['at', startDate, endDate] }),
        as: 'summaries',
      },
      {
        model: CourseUnit,
        attributes: ['id', 'groupId', 'name', 'courseCode'],
        as: 'courseUnits',
        required: true,
        through: {
          attributes: [],
          // where: {
          //   type: 'PRIMARY',
          // },
        },
        include: [
          {
            model: Summary.scope({ method: ['at', startDate, endDate] }),
            as: 'groupSummaries',
            required: true,
          },
          {
            model: FeedbackTarget,
            attributes: ['id', 'courseRealisationId'],
            as: 'feedbackTargets',
            required: true,
            include: [
              {
                model: UserFeedbackTarget,
                as: 'userFeedbackTargets',
                attributes: ['id'],
                required: true,
                where: {
                  userId: user.id,
                  accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
                },
              },
              {
                model: CourseRealisation,
                attributes: ['id', 'name', 'startDate', 'endDate'],
                required: true,
                as: 'courseRealisation',
                include: [
                  {
                    model: Summary.scope({ method: ['at', startDate, endDate] }),
                    as: 'summary',
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  })

  const organisationsJson = organisations.map(org => {
    org.summary = sumSummaries(org.summaries)
    delete org.dataValues.summaries

    const groupedCourseUnits = _.groupBy(org.courseUnits, cu => cu.groupId)
    const courseUnits = Object.values(groupedCourseUnits)
      .flatMap(courseUnits => {
        // Each of courseUnits has the same groupId and groupSummaries (calculated from the group...) so we can do this:
        const cu = courseUnits[0]
        cu.summary = sumSummaries(cu.groupSummaries)
        delete cu.dataValues.groupSummaries

        const courseRealisations = courseUnits.flatMap(cu =>
          cu.feedbackTargets.map(fbt => {
            const { courseRealisation: cur } = fbt
            return cur.toJSON()
          })
        )

        delete cu.dataValues.feedbackTargets

        const resultingCourseUnits = []

        resultingCourseUnits.push({ ...cu.toJSON(), courseRealisations })

        return resultingCourseUnits
      })
      .filter(cu => cu.summary?.data.studentCount > 0)

    return {
      ...org.toJSON(),
      courseUnits: _.orderBy(courseUnits, ['courseCode'], ['asc']),
    }
  })

  return organisationsJson
}

module.exports = {
  getTeacherSummary,
}
