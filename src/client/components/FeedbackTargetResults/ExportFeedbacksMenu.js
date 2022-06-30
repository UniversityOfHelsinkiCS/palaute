import React, { useState } from 'react'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { parseISO, format } from 'date-fns'
import { Button, makeStyles, MenuItem, Menu, Box } from '@material-ui/core'
import Papa from 'papaparse'
import * as _ from 'lodash'
import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles(() => ({
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
}))

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
  const classes = useStyles()

  const { i18n, t } = useTranslation()
  const { language } = i18n

  const headers = getHeaders(feedbackTarget.questions, feedbacks, language)
  const questions = getData(feedbackTarget.questions, feedbacks, language)

  const data = [headers, ...questions]

  const parsedData = Papa.unparse(data, { delimiter: ';' })

  const startDate = format(
    parseISO(feedbackTarget.courseRealisation.startDate),
    'yyyy-MM-dd',
  )
  const filename = `${feedbackTarget.courseUnit.courseCode}_${startDate}.csv`

  return (
    <Button className={classes.button}>
      <CSVLink data={parsedData} className={classes.link} filename={filename}>
        {t('feedbackTargetResults:exportCsv')}
      </CSVLink>
    </Button>
  )
}

const ExportPdfLink = () => {
  const classes = useStyles()

  const { t } = useTranslation()

  return (
    <Button className={classes.button} onClick={() => window.print()}>
      {t('feedbackTargetResults:exportPdf')}
    </Button>
  )
}

const ExportFeedbacksMenu = ({ feedbackTarget, feedbacks }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const classes = useStyles()

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box className={classes.container}>
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
        elevation={2}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem value="csv" className={classes.menuitem}>
          <ExportCsvLink
            feedbackTarget={feedbackTarget}
            feedbacks={feedbacks}
          />
        </MenuItem>
        <MenuItem value="pdf" className={classes.menuitem}>
          <ExportPdfLink />
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportFeedbacksMenu
