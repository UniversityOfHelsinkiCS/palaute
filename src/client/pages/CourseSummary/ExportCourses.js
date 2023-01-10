import React from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@mui/material'
import { format } from 'date-fns'

import ExportButton from '../../components/common/ExportButton'
import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  button: {
    maxHeight: 45,
    color: 'black',
    background: 'white',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: 'white',
      boxShadow: 'none',
    },
  },
}

const getHeaders = (questions, language, t) => {
  const labels = questions
    .map(({ data }) => getLanguageValue(data.label, language))
    .concat([
      t('courseSummary:feedbackCount'),
      t('courseSummary:feedbackPercentage'),
      t('courseSummary:feedbackResponse'),
    ])

  return [t('courseSummary:name'), t('courseSummary:code'), ...labels]
}

const getFeedbackResponseData = (feedbackResponsePercentage, feedbackResponseGiven, t) => {
  if (typeof feedbackResponsePercentage !== 'number')
    return feedbackResponseGiven ? t('courseSummary:given') : t('courseSummary:notGiven')

  return Math.round(feedbackResponsePercentage * 100) / 100
}

const getData = (data, language, t) => {
  const identifiers = data.map(({ name, code, courseCode, organisationCode }) => ({
    name: name[language],
    code: code || courseCode,
    organisationCode,
  }))

  const means = data.map(({ results }) => results.map(({ mean }) => mean))

  const others = data.map(({ feedbackCount, studentCount, feedbackResponsePercentage, feedbackResponseGiven }) => [
    feedbackCount,
    studentCount ? Math.round((feedbackCount / studentCount) * 100) / 100 : 0,
    getFeedbackResponseData(feedbackResponsePercentage, feedbackResponseGiven, t),
  ])

  data = identifiers.map(({ name, code, organisationCode }, i) => [
    name,
    code,
    ...means[i],
    ...others[i],
    organisationCode,
  ])

  return data
}

const exportCsv = (average, organisations, questions, language, t) => {
  const courseUnits = organisations.flatMap(({ courseUnits }) => courseUnits)

  organisations = average ? [average].concat(organisations) : organisations

  const headers = getHeaders(questions, language, t)
  const courseHeaders = headers.concat(t('courseSummary:organisationCode'))

  const courseResults = getData(courseUnits, language, t)
  const organisationResults = getData(organisations, language, t)

  const courseData = [courseHeaders, ...courseResults]
  const organisationData = [headers, ...organisationResults]

  const filename = `course-summary_${format(new Date(), 'yyyy-MM-dd')}`

  const courseSheet = utils.aoa_to_sheet(courseData)
  const organisationSheet = utils.aoa_to_sheet(organisationData)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, courseSheet, 'courses')
  utils.book_append_sheet(workbook, organisationSheet, 'organisations')

  writeFileXLSX(workbook, `${filename}.xlsx`)
}

const ExportCsvLink = ({ average, organisations, questions }) => {
  const { t, i18n } = useTranslation()
  const { language } = i18n

  return (
    <Button sx={styles.button} onClick={() => exportCsv(average, organisations, questions, language, t)}>
      {t('common:exportCsv')}
    </Button>
  )
}

const ExportPdfLink = ({ componentRef }) => {
  const { t } = useTranslation()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  return (
    <Button sx={styles.button} onClick={handlePrint}>
      {t('common:exportPdf')}
    </Button>
  )
}

const ExportCourses = ({ average, organisations, questions, componentRef }) => {
  const { t } = useTranslation()

  return (
    <ExportButton
      CsvLink={<ExportCsvLink average={average} organisations={organisations} questions={questions} />}
      PdfLink={<ExportPdfLink componentRef={componentRef} />}
      label={t('common:export')}
    />
  )
}

export default ExportCourses
