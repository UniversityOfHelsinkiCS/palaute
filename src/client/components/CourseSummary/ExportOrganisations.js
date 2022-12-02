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
    float: 'right',
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

  return [t('courseSummary:programme'), t('courseSummary:code'), ...labels]
}

const getData = (organisations, language) => {
  const organisationNames = organisations.map(({ name, code }) => [
    name[language],
    code,
  ])

  const means = organisations.map(({ results }) =>
    results.map(({ mean }) => mean),
  )

  const others = organisations.map(
    ({ feedbackCount, studentCount, feedbackResponsePercentage }) => [
      feedbackCount,
      studentCount ? Math.round((feedbackCount / studentCount) * 100) / 100 : 0,
      Math.round(feedbackResponsePercentage * 100) / 100,
    ],
  )

  const data = organisationNames.map(([name, code], i) => [
    name,
    code,
    ...means[i],
    ...others[i],
  ])

  return data
}

const ExportCsvLink = ({ organisations, questions }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const headers = getHeaders(questions, language, t)
  const results = getData(organisations, language)

  const data = [headers, ...results]

  const filename = `organisation-summary_${format(new Date(), 'yyyy-MM-dd')}`

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, filename)

  return (
    <Button
      sx={styles.button}
      onClick={() => writeFileXLSX(workbook, `${filename}.xlsx`)}
    >
      {t('courseSummary:exportCsv')}
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
      {t('courseSummary:exportPdf')}
    </Button>
  )
}

const ExportOrganisations = ({ organisations, questions, componentRef }) => {
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
        {t('courseSummary:export')}
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

export default ExportOrganisations
