const _ = require('lodash')
const { Op } = require('sequelize')
const { Organisation, CourseUnit, FeedbackTarget, UserFeedbackTarget, CourseRealisation } = require('../../models')
const { sumSummaries, getScopedSummary } = require('./utils')

const filterHiddenCount = async ({ user, organisationsJson }) => {
  if (!user.isAdmin) {
    organisationsJson.forEach(org => {
      let hasAccess = false
      for (const orgAccess in user.organisationAccess) {
        if (orgAccess === org.code && user.organisationAccess[orgAccess].admin) {
          hasAccess = true
        }
      }
      if (!hasAccess) {
        org.summary.data.hiddenCount = undefined
        org.courseUnits.forEach(courseUnit => {
          courseUnit.summary.data.hiddenCount = undefined
          courseUnit.courseRealisations.forEach(courseRealisation => {
            courseRealisation.summary.data.hiddenCount = undefined
          })
        })
      }
    })
  }
  return organisationsJson
}

const getTeacherSummary = async ({ startDate, endDate, user, extraOrgId, extraOrgMode }) => {
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    include: [
      {
        model: scopedSummary,
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
            model: scopedSummary,
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
                    model: scopedSummary,
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

  let organisationsJson = organisations.map(org => {
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

  organisationsJson = await filterHiddenCount({ user, organisationsJson })

  return organisationsJson
}

module.exports = {
  getTeacherSummary,
}
