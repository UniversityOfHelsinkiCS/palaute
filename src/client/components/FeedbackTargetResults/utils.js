import React from 'react'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { Button, makeStyles } from '@material-ui/core'
import * as _ from 'lodash'
import Papa from 'papaparse'

import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: 'none',
    color: 'white',
  },
}))

const getHeaders = (questions, language) => {
  const headers = questions
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
    const feedback = f.data.map((d) => {
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

export const ExportCsvLink = ({ feedbackTarget, feedbacks }) => {
  const classes = useStyles()

  const { i18n, t } = useTranslation()
  const { language } = i18n

  const headers = getHeaders(feedbackTarget.questions, language)
  const data = getData(feedbackTarget.questions, feedbacks, language)

  const parsedData = Papa.unparse(data)

  const filename = `${feedbackTarget.courseUnit.courseCode}_${feedbackTarget.courseUnit.validityPeriod.startDate}.csv`

  return (
    <Button variant="contained" color="primary">
      <CSVLink
        data={parsedData}
        headers={headers}
        className={classes.link}
        filename={filename}
      >
        {t('feedbackTargetResults:exportCsv')}
      </CSVLink>
    </Button>
  )
}
