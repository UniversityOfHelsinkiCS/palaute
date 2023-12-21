import React from 'react'
import { Button, CircularProgress } from '@mui/material'
import { useSnackbar } from 'notistack'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useSummaryContext } from './context'
import { getCourseUnits, useOrganisationSummaries, useTeacherSummaries } from './api'
import { getLanguageValue } from '../../../util/languageUtils'

const getReportHeaders = (questions, language, t) => {
  const labels = questions.map(({ data }) => getLanguageValue(data.label, language))

  return [
    t('courseSummary:name'),
    t('courseSummary:code'),
    ...labels,
    t('courseSummary:feedbackCount'),
    t('courseSummary:studentCount'),
    t('courseSummary:feedbackPercentage'),
    t('courseSummary:feedbackResponse'),
  ]
}

const generateXLSXReport = async ({
  startDate,
  endDate,
  organisations,
  teacherOrganisations,
  questions,
  t,
  language,
}) => {
  const allCourseUnits = []
  const allOrganisations = []

  // Add course units from teacher organisations that are not in organisations
  allOrganisations.push(
    ...teacherOrganisations.filter(org => !organisations.find(organisation => organisation.id === org.id))
  )

  allOrganisations.push(...organisations.filter(org => org.summary))

  // Fetch course units for all organisations that dont have them yet
  await Promise.all(
    allOrganisations.map(async organisation => {
      let { courseUnits } = organisation
      if (!courseUnits) {
        const { organisation: orgWithCourseUnits } = await getCourseUnits({
          startDate,
          endDate,
          organisationId: organisation.id,
        })
        courseUnits = orgWithCourseUnits ? orgWithCourseUnits.courseUnits : []
      }
      allCourseUnits.push(...courseUnits.map(cu => ({ ...cu, organisationCode: organisation.code })))
    })
  )

  const organisationHeaders = getReportHeaders(questions, language, t)
  const courseHeaders = organisationHeaders.concat(t('courseSummary:organisationCode'))

  const organisationData = allOrganisations.map(org => [
    org.name[language],
    org.code,
    ...questions.map(q => org.summary.data.result[q.id]?.mean ?? 0),
    org.summary.data.feedbackCount,
    org.summary.data.studentCount,
    (org.summary.data.feedbackCount / org.summary.data.studentCount) * 100,
    org.summary.data.feedbackResponsePercentage * 100,
  ])

  const courseData = allCourseUnits.map(cu => [
    cu.name[language],
    cu.courseCode,
    ...questions.map(q => cu.summary.data.result[q.id]?.mean ?? 0),
    cu.summary.data.feedbackCount,
    cu.summary.data.studentCount,
    (cu.summary.data.feedbackCount / cu.summary.data.studentCount) * 100,
    cu.summary.data.feedbackResponsePercentage * 100,
    cu.organisationCode,
  ])

  const organisationSheet = utils.aoa_to_sheet([organisationHeaders, ...organisationData])
  const courseSheet = utils.aoa_to_sheet([courseHeaders, ...courseData])

  const workbook = utils.book_new()

  utils.book_append_sheet(workbook, organisationSheet, t('courseSummary:organisations'))
  utils.book_append_sheet(workbook, courseSheet, t('courseSummary:courses'))

  const filename = `course-summary_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
  writeFileXLSX(workbook, filename, { type: 'file' })
}

const GenerateReport = () => {
  const { enqueueSnackbar } = useSnackbar()
  const { t, i18n } = useTranslation()
  const [isGenerating, setIsGenerating] = React.useState(false)
  const { dateRange, questions } = useSummaryContext()

  const { organisations, isSuccess: organisationsLoaded } = useOrganisationSummaries({
    startDate: dateRange.start,
    endDate: dateRange.end,
    viewingMode: 'flat',
    enabled: isGenerating,
  })
  const { organisations: teacherOrganisations, isSuccess: teacherOrganisationsLoaded } = useTeacherSummaries({
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: isGenerating,
  })

  React.useEffect(() => {
    if (isGenerating && organisationsLoaded && teacherOrganisationsLoaded) {
      generateXLSXReport({
        organisations,
        teacherOrganisations,
        questions,
        startDate: dateRange.start,
        endDate: dateRange.end,
        t,
        language: i18n.language,
      })
        .then(() => {
          setIsGenerating(false)
        })
        .catch(() => {
          setIsGenerating(false)
          enqueueSnackbar(t('common:unknownError'))
        })
    }
  }, [organisationsLoaded, teacherOrganisationsLoaded, isGenerating])

  return (
    <Button variant="contained" onClick={() => setIsGenerating(true)} disabled={isGenerating}>
      {!isGenerating ? t('common:exportXLSX') : <CircularProgress />}
    </Button>
  )
}

export default GenerateReport
