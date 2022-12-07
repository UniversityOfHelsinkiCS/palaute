import React, { useState } from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { Button, MenuItem, Menu, Box } from '@mui/material'
import { format } from 'date-fns'

import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  link: {
    textDecoration: 'none',
    color: 'black',
  },
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
  form: {
    width: 175,
    minWidth: 175,
  },
  container: {
    paddingLeft: '1rem',
    textAlign: 'left',
    '@media print': {
      display: 'none',
    },
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuitem: {
    cursor: 'pointer',
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

const getFeedbackResponseData = (
  feedbackResponsePercentage,
  feedbackResponseGiven,
  t,
) => {
  if (typeof feedbackResponsePercentage !== 'number')
    return feedbackResponseGiven
      ? t('courseSummary:given')
      : t('courseSummary:notGiven')

  return Math.round(feedbackResponsePercentage * 100) / 100
}

const getData = (data, language, t) => {
  const names = data.map(({ name, code, courseCode }) => [
    name[language],
    code || courseCode,
  ])

  const means = data.map(({ results }) => results.map(({ mean }) => mean))

  const others = data.map(
    ({
      feedbackCount,
      studentCount,
      feedbackResponsePercentage,
      feedbackResponseGiven,
    }) => [
      feedbackCount,
      studentCount ? Math.round((feedbackCount / studentCount) * 100) / 100 : 0,
      getFeedbackResponseData(
        feedbackResponsePercentage,
        feedbackResponseGiven,
        t,
      ),
    ],
  )

  data = names.map(([name, code], i) => [name, code, ...means[i], ...others[i]])

  return data
}

const exportCsv = (organisations, questions, language, t) => {
  const courseUnits = organisations.flatMap(({ courseUnits }) => courseUnits)

  const headers = getHeaders(questions, language, t)

  const courseResults = getData(courseUnits, language, t)
  const organisationResults = getData(organisations, language, t)

  const courseData = [headers, ...courseResults]
  const organisationData = [headers, ...organisationResults]

  const filename = `course-summary_${format(new Date(), 'yyyy-MM-dd')}`

  const courseSheet = utils.aoa_to_sheet(courseData)
  const organisationSheet = utils.aoa_to_sheet(organisationData)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, courseSheet, 'courses')
  utils.book_append_sheet(workbook, organisationSheet, 'organisations')

  writeFileXLSX(workbook, `${filename}.xlsx`)
}

const ExportCsvLink = ({ organisations, questions }) => {
  const { t, i18n } = useTranslation()
  const { language } = i18n

  return (
    <Button
      sx={styles.button}
      onClick={() => exportCsv(organisations, questions, language, t)}
    >
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

const ExportCourses = ({ organisations, questions, componentRef }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={styles.container}>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        color="primary"
        onClick={handleClick}
      >
        {t('common:export')}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem value="csv" sx={styles.menuitem}>
          <ExportCsvLink organisations={organisations} questions={questions} />
        </MenuItem>
        <MenuItem value="pdf" sx={styles.menuitem}>
          <ExportPdfLink componentRef={componentRef} />
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportCourses
