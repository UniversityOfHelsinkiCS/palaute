import _ from 'lodash'
import {
  CourseUnit,
  FeedbackTarget,
  CourseRealisation,
  CourseRealisationsOrganisation,
  CourseUnitsOrganisation,
  UserFeedbackTarget,
  User,
  Summary,
} from '../../models'
import { sumSummaries, getScopedSummary } from './utils'
import { getAccessibleCourseRealisationIds } from './access'
import { ApplicationError } from '../../util/ApplicationError'
import { getUserOrganisationAccess } from '../organisationAccess/organisationAccess'
import { getAllUniversitySurveys } from '../surveys'
import { Survey } from '../../models/survey'

type GetCourseUnitGroupSummaryParams = {
  user: User
  courseCode: string
  startDate: string
  endDate: string
  allTime?: boolean
}

export const getCourseUnitGroupSummaries = async ({
  user,
  courseCode,
  startDate,
  endDate,
  allTime,
}: GetCourseUnitGroupSummaryParams) => {
  const orgAccess = await getUserOrganisationAccess(user)
  const accessibleCurIds = await getAccessibleCourseRealisationIds(user)
  const scopedSummary = getScopedSummary({ startDate, endDate, allTime })

  // Early exit for students, "DOS prevention" :D
  if (Object.keys(orgAccess).length === 0 && accessibleCurIds.length === 0)
    throw ApplicationError.Forbidden('No access')

  const courseUnits = await CourseUnit.findAll({
    where: {
      courseCode,
    },
    include: [
      {
        model: CourseUnitsOrganisation,
        as: 'courseUnitsOrganisations',
        attributes: ['organisationId'],
      },
      {
        model: FeedbackTarget,
        as: 'feedbackTargets',
        attributes: ['id', 'feedbackResponse', 'feedbackResponseEmailSent', 'closesAt', 'opensAt'],
        separate: true,
        where: {
          userCreated: false,
        },
        include: [
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            include: [
              {
                model: CourseRealisationsOrganisation,
                as: 'courseRealisationsOrganisations',
                attributes: ['organisationId'],
              },
            ],
          },
          {
            model: scopedSummary,
            as: 'summary',
            required: true,
          },
          {
            model: UserFeedbackTarget.scope('teachers'),
            attributes: ['userId', 'accessStatus', 'isAdministrativePerson'],
            as: 'userFeedbackTargets',
            include: [
              {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email'],
                as: 'user',
              },
            ],
          },
        ],
      },
    ],
    order: [['validityPeriod.startDate', 'desc']], // Ordering! Now [0] is the newest.
  })

  if (!courseUnits?.length) {
    return null
  }

  const feedbackTargets = courseUnits.flatMap(cu => cu.feedbackTargets)
  const cuOrgIds = courseUnits.flatMap(cu => cu.courseUnitsOrganisations?.map(cuo => cuo.organisationId))
  const curOrgIds = courseUnits.flatMap(cu =>
    cu.feedbackTargets?.flatMap(
      fbt => fbt.courseRealisation?.courseRealisationsOrganisations?.map(curo => curo.organisationId) ?? []
    )
  )
  const allOrgIds = cuOrgIds.concat(curOrgIds)

  const hasOrgAccess = Object.values(orgAccess).some(o => allOrgIds.includes(o.organisation.id))
  if (!user.isAdmin && !hasOrgAccess) {
    const hasCurAccess = feedbackTargets.some(
      fbt => fbt?.courseRealisation?.id && accessibleCurIds.includes(fbt.courseRealisation.id)
    )
    if (!hasCurAccess) {
      throw ApplicationError.Forbidden('No access')
    }
  }

  const orderedFeedbackTargets = _.orderBy(feedbackTargets, fbt => fbt?.courseRealisation?.startDate, 'desc')

  type SurveyGroup = {
    survey: Survey | null
    summary: Summary | undefined
    feedbackTargets: FeedbackTarget[]
  }

  // must convert to JSON to avoid sumSummaries modifying the original summary objects
  // TODO: remove the conversion and `as Summary` cast once sumSummaries is fixed
  const summarizeGroup = (fbts: typeof orderedFeedbackTargets) =>
    sumSummaries(
      fbts
        .filter(fbt => fbt?.opensAt <= new Date())
        .map(fbt => fbt?.summary?.toJSON() as Summary)
        .filter(s => Boolean(s))
    )

  // grouping the feedback targets by the university survey they correspond to (only in allTime mode)
  let surveyGroups: SurveyGroup[]

  if (allTime) {
    const allSurveys = await getAllUniversitySurveys()
    const surveysAsc = [...allSurveys].sort((a, b) => {
      if (a.validFrom === null) return -1
      if (b.validFrom === null) return 1
      return a.validFrom.getTime() - b.validFrom.getTime()
    })

    const getEffectiveSurvey = (fbt: FeedbackTarget) => {
      if (!fbt.opensAt) return surveysAsc[0]
      const opensAt = new Date(fbt.opensAt)
      let result = surveysAsc[0]
      for (const survey of surveysAsc) {
        if (survey.validFrom === null || survey.validFrom.getTime() <= opensAt.getTime()) {
          result = survey
        }
      }
      return result
    }

    const groupsMap = new Map<number, { survey: Survey; feedbackTargets: FeedbackTarget[] }>()
    for (const fbt of orderedFeedbackTargets) {
      const survey = getEffectiveSurvey(fbt)
      if (!survey) continue
      if (!groupsMap.has(survey.id)) groupsMap.set(survey.id, { survey, feedbackTargets: [] })
      groupsMap.get(survey.id).feedbackTargets.push(fbt)
    }

    // Return groups in validFrom DESC NULLS LAST order (newest first), matching allSurveys order.
    surveyGroups = allSurveys
      .filter(s => groupsMap.has(s.id))
      .map(s => {
        const g = groupsMap.get(s.id)
        return { survey: g.survey, feedbackTargets: g.feedbackTargets, summary: summarizeGroup(g.feedbackTargets) }
      })
  } else {
    surveyGroups = [
      { survey: null, feedbackTargets: orderedFeedbackTargets, summary: summarizeGroup(orderedFeedbackTargets) },
    ]
  }

  return { courseCode: courseUnits[0].courseCode, name: courseUnits[0].name, surveyGroups }
}
