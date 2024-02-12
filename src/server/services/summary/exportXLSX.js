const XLSX = require('xlsx')
const _ = require('lodash')
const { Op } = require('sequelize')
const { getSummaryAccessibleOrganisationIds, getAccessibleCourseRealisationIds } = require('./access')
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
const { getScopedSummary, sumSummaries } = require('./utils')
const { SUMMARY_EXCLUDED_ORG_IDS } = require('../../util/config')

const exportXLSX = async ({ user, startDate, endDate, includeOrgs, includeCUs, includeCURs }) => {
  const workbook = XLSX.utils.book_new()

  const scopedSummary = getScopedSummary(startDate, endDate)
  const questions = await getSummaryQuestions()
  const accessibleOrganisationIds = await getSummaryAccessibleOrganisationIds(user)
  const accessibleCourseRealisationIds = await getAccessibleCourseRealisationIds(user)

  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    where: {
      id: {
        [Op.in]: accessibleOrganisationIds,
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
    attributes: ['courseCode', 'name', 'id'],
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

  if (includeOrgs) {
    const organisationsJson = organisations.map(org => {
      org.summary = sumSummaries(org.summaries)
      delete org.dataValues.summaries
      return org.toJSON()
    })

    // In xlsx terms aoa = array of arrays
    const organisationsAoa = organisationsJson.map(org => [
      org.code,
      getLanguageValue(org.name, user.language),
      ...questions.map(q => org.summary.data.result[q.id].mean),
      org.summary.data.studentCount,
      org.summary.data.feedbackCount,
      org.summary.data.feedbackResponsePercentage * 100,
    ])

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(organisationsAoa), 'organisations')
  }

  if (includeCUs) {
    const courseUnitsJson = _.uniqBy(
      courseUnits.map(cu => ({
        summary: sumSummaries(cu.groupSummaries),
        ...cu.toJSON(),
      }))
    )

    const courseUnitsAoa = courseUnitsJson.map(cu => [
      cu.courseCode,
      getLanguageValue(cu.name, user.language),
      ...questions.map(q => cu.summary.data.result[q.id].mean),
      cu.summary.data.studentCount,
      cu.summary.data.feedbackCount,
      cu.summary.data.feedbackResponsePercentage * 100,
    ])

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(courseUnitsAoa), 'course-units')
  }

  if (includeCURs) {
    const organisationCourseRealisationIds = organisations
      .flatMap(org => org.courseRealisationsOrganisations.map(curo => curo.courseRealisationId))
      .concat(courseUnits.flatMap(cu => cu.feedbackTargets.map(fbt => fbt.courseRealisationId)))

    const courseRealisations = await CourseRealisation.findAll({
      attributes: ['id', 'name', 'startDate', 'endDate'],
      where: {
        id: accessibleCourseRealisationIds.concat(organisationCourseRealisationIds),
      },
      include: {
        model: scopedSummary,
        as: 'summary',
        required: true,
      },
    })

    const courseRealisationsAoa = courseRealisations.map(cur => [
      cur.id,
      getLanguageValue(cur.name, user.language),
      cur.startDate,
      cur.endDate,
      ...questions.map(q => cur.summary.data.result[q.id].mean),
      cur.summary.data.studentCount,
      cur.summary.data.feedbackCount,
      cur.summary.data.feedbackResponsePercentage * 100,
    ])

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(courseRealisationsAoa), 'course-realisations')
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
