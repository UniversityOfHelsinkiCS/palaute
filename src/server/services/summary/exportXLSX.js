const XLSX = require('xlsx')
const _ = require('lodash')
const { Op } = require('sequelize')
const { getSummaryAccessibleOrganisationIds } = require('./access')
const { getLanguageValue } = require('../../util/languageUtils')
const { getSummaryQuestions } = require('../questions')
const {
  Organisation,
  CourseUnit,
  FeedbackTarget,
  CourseRealisationsOrganisation,
  CourseRealisation,
  CourseUnitsOrganisation,
} = require('../../models')
const { getScopedSummary, sumSummaries, getOrganisationCodeById, mapCourseIdsToCourseCodes } = require('./utils')
const { SUMMARY_EXCLUDED_ORG_IDS } = require('../../util/config')
const { i18n } = require('../../util/i18n')
const { getTeacherSummary } = require('./getTeacherSummary')
const { getAccessibleCourseRealisationIds } = require('./access')
const { ApplicationError } = require('../../util/customErrors')

const getOrganisations = async (scopedSummary, organisationIds) => {
  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    where: {
      id: {
        [Op.in]: organisationIds,
        [Op.notIn]: SUMMARY_EXCLUDED_ORG_IDS,
      },
    },
    include: [
      {
        model: scopedSummary,
        as: 'summaries',
        required: true,
      },
      {
        model: CourseUnitsOrganisation,
        as: 'courseUnitsOrganisations',
        attributes: ['courseUnitId'],
        separate: true,
      },
      {
        model: CourseRealisationsOrganisation,
        as: 'courseRealisationsOrganisations',
        attributes: ['courseRealisationId'],
        separate: true,
      },
    ],
    order: [['code', 'ASC']],
  })

  return organisations
}

const getCourseUnits = async (scopedSummary, courseUnitIds) => {
  const courseUnits = await CourseUnit.findAll({
    where: {
      id: courseUnitIds,
    },
    attributes: ['courseCode', 'name', 'id', 'groupId'],
    include: [
      {
        model: scopedSummary,
        as: 'groupSummaries',
        required: true,
      },
      {
        model: FeedbackTarget, // To join CURs later
        as: 'feedbackTargets',
        attributes: ['courseRealisationId', 'id'],
        required: true,
      },
    ],
  })

  return courseUnits
}

const getCourseRealisations = async (scopedSummary, courseRealisationIds) => {
  const courseRealisations = await CourseRealisation.findAll({
    attributes: ['id', 'name', 'startDate', 'endDate'],
    where: {
      id: _.uniq(courseRealisationIds),
    },
    include: [
      {
        model: scopedSummary,
        as: 'summary',
        required: true,
      },
      {
        model: CourseRealisationsOrganisation,
        as: 'courseRealisationsOrganisations',
        attributes: ['organisationId'],
        required: true,
      },
      {
        model: FeedbackTarget,
        as: 'feedbackTargets',
        attributes: ['id'],
        required: true,
        include: {
          model: CourseUnit,
          as: 'courseUnit',
          attributes: ['courseCode'],
          required: true,
        },
      },
    ],
  })

  return courseRealisations
}

const getAccessibleCourseRealisations = async (user, courseRealisations) => {
  const orgAccess = await user.getOrganisationAccess()
  const accessibleCurIds = await getAccessibleCourseRealisationIds(user)

  const accessibleCourseRealisations = courseRealisations.filter(cur => {
    const curOrgIds = cur.courseRealisationsOrganisations?.map(curo => curo.organisationId) ?? []
    const hasOrgAccess = Object.values(orgAccess).some(o => curOrgIds.includes(o.organisation.id))
    if (user.isAdmin || hasOrgAccess) return true

    return accessibleCurIds.includes(cur.id)
  })

  return accessibleCourseRealisations
}

const getDefaultHeaders = (questions, t, language) => {
  const defaultHeaders = questions
    .map(q => getLanguageValue(q.data?.label, language))
    .concat([t('common:studentCount'), t('courseSummary:feedbackCount'), t('courseSummary:feedbackResponsePercentage')])

  return defaultHeaders
}

// In xlsx terms aoa = array of arrays
const commonPartOfAoa = (language, questions, target) => {
  const targetName = getLanguageValue(target.name, language)
  const summaryData = target.summary.data

  const questionResults = questions.map(q => summaryData.result[q.id]?.mean ?? 0)

  return [
    targetName,
    ...questionResults,
    summaryData.studentCount,
    summaryData.feedbackCount,
    summaryData.feedbackResponsePercentage * 100,
  ]
}

const getUniqueHeaders = (t, sheetName) => {
  if (sheetName === 'organisations') return [t('common:organisationCode'), t('common:name')]

  if (sheetName === 'course-units') return ['group_id', t('common:courseCode'), t('common:name')]

  return ['id', t('common:courseCode'), t('common:name'), t('common:startDate'), t('common:endDate')]
}

const getJSON = (targets, targetType) => {
  const targetJSON = targets.map(target => {
    target.summary = sumSummaries(targetType === 'org' ? target.summaries : target.groupSummaries)
    if (targetType === 'org') {
      delete target.dataValues.summaries
    } else {
      delete target.dataValues.groupSummaries
    }

    return target.toJSON()
  })

  return targetJSON
}

const getOrganisationCourseRealisationIds = (organisations, courseUnits) =>
  organisations
    .flatMap(org => org.courseRealisationsOrganisations.map(curo => curo.courseRealisationId))
    .concat(courseUnits.flatMap(cu => cu.feedbackTargets.map(fbt => fbt.courseRealisationId)))

const exportXLSX = async ({
  user,
  startDate,
  endDate,
  includeOrgs,
  includeCUs,
  includeCURs,
  allTime,
  organisationId,
}) => {
  const accessibleOrganisationIds = await getSummaryAccessibleOrganisationIds(user)

  if (organisationId && !accessibleOrganisationIds.includes(organisationId)) {
    return ApplicationError.Forbidden('User does not have access to the organisation')
  }

  const t = i18n.getFixedT(user.language)

  const organisationCode = organisationId ? await getOrganisationCodeById(organisationId) : undefined
  const questions = await getSummaryQuestions(organisationCode)
  const defaultHeaders = getDefaultHeaders(questions, t, user.language)

  const workbook = XLSX.utils.book_new()
  const addSheetToWorkbook = (dataAoa, sheetName) => {
    const headers = [[...getUniqueHeaders(t, sheetName), ...defaultHeaders]]
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(headers.concat(dataAoa)), sheetName)
  }

  const scopedSummary = getScopedSummary({ startDate, endDate, allTime })

  const teacherOrganisations = await getTeacherSummary({ user, startDate, endDate, allTime })

  const organisationIds = organisationId ? [organisationId] : accessibleOrganisationIds
  const organisations = await getOrganisations(scopedSummary, organisationIds)

  const courseUnitIds = organisations.flatMap(org => org.courseUnitsOrganisations.map(cuo => cuo.courseUnitId))
  const courseUnits = await getCourseUnits(scopedSummary, courseUnitIds)

  const getAllTargets = (organisationTargets, targetType) => {
    let teacherOrganisationsTargets = teacherOrganisations

    if (targetType === 'cu') {
      teacherOrganisationsTargets = teacherOrganisations.flatMap(org => org.courseUnits)
    } else if (targetType === 'cur') {
      teacherOrganisationsTargets = teacherOrganisations.flatMap(org =>
        org.courseUnits.flatMap(cu => cu.courseRealisations)
      )
    }

    const allTargets = _.uniqBy(
      organisationId ? organisationTargets : organisationTargets.concat(teacherOrganisationsTargets),
      'id'
    )

    return allTargets
  }

  if (includeOrgs) {
    const allOrganisations = getAllTargets(getJSON(organisations, 'org'), 'org')

    const organisationsAoa = allOrganisations.map(org => [org.code, ...commonPartOfAoa(user.language, questions, org)])

    addSheetToWorkbook(organisationsAoa, 'organisations')
  }

  if (includeCUs) {
    const allCourseUnits = getAllTargets(getJSON(_.uniqBy(courseUnits, 'groupId'), 'cu'), 'cu')

    const courseUnitsAoa = allCourseUnits.map(cu => [
      cu.groupId,
      cu.courseCode,
      ...commonPartOfAoa(user.language, questions, cu),
    ])

    addSheetToWorkbook(courseUnitsAoa, 'course-units')
  }

  if (includeCURs) {
    const organisationCourseRealisationIds = getOrganisationCourseRealisationIds(organisations, courseUnits)

    const courseRealisations = await getCourseRealisations(scopedSummary, organisationCourseRealisationIds)

    const allCourseRealisations = getAllTargets(courseRealisations, 'cur')

    const accessibleCourseRealisations = await getAccessibleCourseRealisations(user, allCourseRealisations)

    const curIdToCourseCode = mapCourseIdsToCourseCodes(teacherOrganisations, courseRealisations)

    const courseRealisationsAoa = accessibleCourseRealisations.map(cur => {
      const courseCode = curIdToCourseCode[cur.id] || ''
      const [curName, ...rest] = commonPartOfAoa(user.language, questions, cur)

      return [cur.id, courseCode, curName, cur.startDate, cur.endDate, ...rest]
    })

    addSheetToWorkbook(courseRealisationsAoa, 'course-realisations')
  }

  const xlsxFile = XLSX.write(workbook, { type: 'buffer', bookSST: false })
  const fileName = `norppa_${startDate}-${endDate}.xlsx`

  return {
    xlsxFile,
    fileName,
  }
}

module.exports = {
  exportXLSX,
}
