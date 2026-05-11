import _ from 'lodash'
import { InferAttributes, Op } from 'sequelize'
import { Organisation, CourseUnit, FeedbackTarget, UserFeedbackTarget, CourseRealisation, User } from '../../models'
import { SummaryData } from '../../models/summary'
import { sumSummaries, getScopedSummary } from './utils'

type SummaryDataWithOptionalHiddenCount = Omit<SummaryData, 'hiddenCount'> & { hiddenCount?: number }

const deleteHiddenCount = (summaryData?: SummaryData) => {
  delete (summaryData as SummaryDataWithOptionalHiddenCount).hiddenCount
}

const filterHiddenCount = async ({
  user,
  organisationsJson,
}: {
  user: User
  organisationsJson: InferAttributes<Organisation>[]
}) => {
  if (!user.isAdmin) {
    organisationsJson.forEach(org => {
      let hasAccess = false
      for (const orgAccess in user.organisationAccess) {
        if (orgAccess === org.code && user.organisationAccess[orgAccess].admin) {
          hasAccess = true
        }
      }
      if (!hasAccess) {
        deleteHiddenCount(org.summary?.data)
        org.courseUnits?.forEach(courseUnit => {
          deleteHiddenCount(courseUnit.summary?.data)
          courseUnit.courseRealisations?.forEach(courseRealisation => {
            deleteHiddenCount(courseRealisation.summary?.data)
          })
        })
      }
    })
  }
  return organisationsJson
}

interface GetTeacherSummaryParams {
  startDate: string
  endDate: string
  user: User
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude' | 'only'
}

export const getTeacherSummary = async ({
  startDate,
  endDate,
  user,
  extraOrgId,
  extraOrgMode,
}: GetTeacherSummaryParams) => {
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
          cu.feedbackTargets?.map(fbt => {
            const { courseRealisation: cur } = fbt
            return cur?.toJSON()
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

  return filterHiddenCount({ user, organisationsJson })
}
