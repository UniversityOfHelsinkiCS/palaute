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
const { getScopedSummary, sumSummaries, getOrganisationCodeById } = require('./utils')
const { SUMMARY_EXCLUDED_ORG_IDS } = require('../../util/config')
const { i18n } = require('../../util/i18n')
const { getTeacherSummary } = require('./getTeacherSummary')
const { ApplicationError } = require('../../util/customErrors')

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
  const workbook = XLSX.utils.book_new()

  const scopedSummary = getScopedSummary({ startDate, endDate, allTime })

  const organisationCode = organisationId ? await getOrganisationCodeById(organisationId) : undefined

  const questions = await getSummaryQuestions(organisationCode)
  const accessibleOrganisationIds = await getSummaryAccessibleOrganisationIds(user)

  if (organisationId && !accessibleOrganisationIds.includes(organisationId)) {
    return ApplicationError.Forbidden('User does not have access to the organisation')
  }
  const organisationIds = organisationId ? [organisationId] : accessibleOrganisationIds

  let earliestStartDate = new Date(startDate)
  let latestEndDate = new Date(endDate)

  const teacherOrganisations = await getTeacherSummary({ user, startDate, endDate, allTime })

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

  const courseUnitIds = organisations.flatMap(org => org.courseUnitsOrganisations.map(cuo => cuo.courseUnitId))

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

  const t = i18n.getFixedT(user.language)
  const defaultHeaders = questions
    .map(q => getLanguageValue(q.data.label, user.language))
    .concat([t('common:studentCount'), t('courseSummary:feedbackCount'), t('courseSummary:feedbackResponsePercentage')])

  if (includeOrgs) {
    const organisationsJson = organisations.map(org => {
      org.summary = sumSummaries(org.summaries)
      delete org.dataValues.summaries
      earliestStartDate = org.summary.startDate
      latestEndDate = org.summary.endDate
      return org.toJSON()
    })

    const allOrganisations = _.uniqBy(
      organisationId ? organisationsJson : organisationsJson.concat(teacherOrganisations),
      'id'
    )

    // In xlsx terms aoa = array of arrays
    const organisationsAoa = allOrganisations.map(org => [
      org.code,
      getLanguageValue(org.name, user.language),
      ...questions.map(q => org.summary.data.result[q.id]?.mean ?? 0),
      org.summary.data.studentCount,
      org.summary.data.feedbackCount,
      org.summary.data.feedbackResponsePercentage * 100,
    ])

    const headers = [[t('common:organisationCode'), t('common:name'), ...defaultHeaders]]

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(headers.concat(organisationsAoa)), 'organisations')
  }

  if (includeCUs) {
    const courseUnitsJson = _.uniqBy(courseUnits, 'groupId').map(cu => {
      cu.summary = sumSummaries(cu.groupSummaries)
      delete cu.dataValues.summaries
      earliestStartDate = cu.summary.startDate
      latestEndDate = cu.summary.endDate
      return cu.toJSON()
    })

    const allCourseUnits = _.uniqBy(
      organisationId ? courseUnitsJson : courseUnitsJson.concat(teacherOrganisations.flatMap(org => org.courseUnits)),
      'id'
    )

    const courseUnitsAoa = allCourseUnits.map(cu => [
      cu.groupId,
      cu.courseCode,
      getLanguageValue(cu.name, user.language),
      ...questions.map(q => cu.summary.data.result[q.id]?.mean ?? 0),
      cu.summary.data.studentCount,
      cu.summary.data.feedbackCount,
      cu.summary.data.feedbackResponsePercentage * 100,
    ])

    const headers = [['group_id', t('common:courseCode'), t('common:name'), ...defaultHeaders]]

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(headers.concat(courseUnitsAoa)), 'course-units')
  }

  if (includeCURs) {
    const organisationCourseRealisationIds = organisations
      .flatMap(org => org.courseRealisationsOrganisations.map(curo => curo.courseRealisationId))
      .concat(courseUnits.flatMap(cu => cu.feedbackTargets.map(fbt => fbt.courseRealisationId)))

    const courseRealisations = await CourseRealisation.findAll({
      attributes: ['id', 'name', 'startDate', 'endDate'],
      where: {
        id: _.uniq(organisationCourseRealisationIds),
      },
      include: [
        {
          model: scopedSummary,
          as: 'summary',
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

    const curIdToCourseCode = {}

    const teacherOrgCUs = teacherOrganisations.flatMap(org => org.courseUnits)

    teacherOrgCUs.forEach(cu => {
      cu.courseRealisations.forEach(cur => {
        curIdToCourseCode[cur.id] = cu.courseCode
      })
    })

    courseRealisations.forEach(cur => {
      cur.feedbackTargets.forEach(fbt => {
        curIdToCourseCode[cur.id] = fbt.courseUnit.courseCode
      })
    })

    const allCourseRealisations = _.uniqBy(
      organisationId
        ? courseRealisations
        : courseRealisations.concat(
            teacherOrganisations.flatMap(org => org.courseUnits.flatMap(cu => cu.courseRealisations))
          ),
      'id'
    )

    const courseRealisationsAoa = allCourseRealisations.map(cur => {
      earliestStartDate = cur.summary.startDate
      latestEndDate = cur.summary.endDate
      const courseCode = curIdToCourseCode[cur.id] || ''

      return [
        cur.id,
        courseCode,
        getLanguageValue(cur.name, user.language),
        cur.startDate,
        cur.endDate,
        ...questions.map(q => cur.summary.data.result[q.id]?.mean ?? 0),
        cur.summary.data.studentCount,
        cur.summary.data.feedbackCount,
        cur.summary.data.feedbackResponsePercentage * 100,
      ]
    })

    const headers = [
      ['id', t('common:courseCode'), t('common:name'), t('common:startDate'), t('common:endDate'), ...defaultHeaders],
    ]

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(headers.concat(courseRealisationsAoa)),
      'course-realisations'
    )
  }

  const xlsxFile = XLSX.write(workbook, { type: 'buffer', bookSST: false })

  const fileName = `norppa_${earliestStartDate}-${latestEndDate}.xlsx`

  return {
    xlsxFile,
    fileName,
  }
}

module.exports = {
  exportXLSX,
}
