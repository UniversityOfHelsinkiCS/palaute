import React, { useState } from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { Button, MenuItem, Menu, Box } from '@mui/material'
import * as _ from 'lodash'
import { getCourseStartDate } from './utils'
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 10,
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

const getHeaders = (questions, feedbacks, language) => {
  const orderOfIds = feedbacks[0].data.map((f) => f.questionId)
  const sortedQuestions = questions.sort(
    (a, b) => orderOfIds.indexOf(a.id) - orderOfIds.indexOf(b.id),
  )

  const headers = sortedQuestions
    .filter((q) => {
      if (!q.data.label) return false
      return true
    })
    .map((q) => getLanguageValue(q.data.label, language))

  return headers
}

const getData = (questions, feedbacks, language) => {
  const options = _.flatMap(questions, (q) =>
    ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type)
      ? q.data?.options ?? []
      : [],
  )

  const optionById = _.keyBy(options, ({ id }) => id)

  const data = feedbacks.map((f) => {
    const feedback = f.data
      .filter((d) => questions.find((q) => q.id === d.questionId))
      .map((d) => {
        const q = questions.find((q) => q.id === d.questionId)

        if (['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type)) {
          const option = optionById[d.data]
          return getLanguageValue(option?.label, language)
        }

        return d.data
      })
    return feedback
  })

  return data
}

const ExportCsvLink = ({ feedbackTarget, feedbacks }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const headers = getHeaders(feedbackTarget.questions, feedbacks, language)
  const questions = getData(feedbackTarget.questions, feedbacks, language)

  const data = [headers, ...questions]

  const filename = `${
    feedbackTarget.courseUnit.courseCode
  }_${getCourseStartDate(feedbackTarget)}`

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, filename)

  return (
    <Button
      sx={styles.button}
      onClick={() => writeFileXLSX(workbook, `${filename}.xlsx`)}
    >
      {t('exportCsv')}
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
      {t('exportPdf')}
    </Button>
  )
}

const ExportFeedbacksMenu = ({ feedbackTarget, feedbacks, componentRef }) => {
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
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        {t('feedbackTargetResults:export')}
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
          <ExportCsvLink
            feedbackTarget={feedbackTarget}
            feedbacks={feedbacks}
          />
        </MenuItem>
        <MenuItem value="pdf" sx={styles.menuitem}>
          <ExportPdfLink componentRef={componentRef} />
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportFeedbacksMenu
