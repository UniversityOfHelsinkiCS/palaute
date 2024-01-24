const _ = require('lodash')
const { Op } = require('sequelize')
const {
  Organisation,
  Summary,
  CourseUnit,
  FeedbackTarget,
  UserFeedbackTarget,
  CourseRealisation,
  CourseRealisationsOrganisation,
} = require('../../models')
const { sumSummaries, subtractSummary } = require('./utils')

const getTeacherSummary = async ({ startDate, endDate, user, separateOrganisationId }) => {
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
                  {
                    model: CourseRealisationsOrganisation,
                    as: 'courseRealisationsOrganisations',
                    separate: true,
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

  const separatedOrganisation = separateOrganisationId ? await Organisation.findByPk(separateOrganisationId) : null

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

        // If we have separateOrganisationId, we want to create a separate cu summary by that organisation, and not include it in the course unit's summary.
        if (separatedOrganisation) {
          // First find all course realisations that belong to the separate organisation.
          const separateCourseRealisations = courseRealisations.filter(cur =>
            cur.courseRealisationsOrganisations.some(cro => cro.organisationId === separateOrganisationId)
          )

          // Summarise them.
          const separateSummary = sumSummaries(separateCourseRealisations.map(cur => cur.summary))

          if (separateSummary) {
            // Subtract the separate summary from the main course unit summary.
            cu.summary = subtractSummary(cu.summary, separateSummary)

            // Create a separate course unit (its entirely artificial).
            const separateCourseUnit = {
              ...cu.toJSON(),
              id: `${cu.id}-${separatedOrganisation.id}`,
              summary: separateSummary,
              courseRealisations: separateCourseRealisations,
              separateOrganisation: separatedOrganisation,
            }

            resultingCourseUnits.push(separateCourseUnit)
          }
        }

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
