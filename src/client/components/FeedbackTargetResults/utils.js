import React from 'react'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { Button, makeStyles } from '@material-ui/core'
import * as _ from 'lodash'
import Papa from 'papaparse'
import { format, parseISO, set } from 'date-fns'

import { getLanguageValue } from '../../util/languageUtils'
import apiClient from '../../util/apiClient'

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: 'none',
    color: 'white',
  },
  button: {
    maxHeight: 45,
    marginLeft: 10,
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

export const ExportCsvLink = ({ feedbackTarget, feedbacks }) => {
  const classes = useStyles()

  const { i18n, t } = useTranslation()
  const { language } = i18n

  const headers = getHeaders(feedbackTarget.questions, language)
  const questions = getData(feedbackTarget.questions, feedbacks, language)

  const data = [headers, ...questions]

  const parsedData = Papa.unparse(data, { delimiter: ';' })

  const filename = `${feedbackTarget.courseUnit.courseCode}_${feedbackTarget.courseUnit.validityPeriod.startDate}.csv`

  return (
    <Button variant="contained" color="primary" className={classes.button}>
      <CSVLink data={parsedData} className={classes.link} filename={filename}>
        {t('feedbackTargetResults:exportCsv')}
      </CSVLink>
    </Button>
  )
}

export const formatCourseDate = (courseRealisation) => {
  const startDate = format(parseISO(courseRealisation.startDate), 'dd.MM.yyyy')
  const endDate = format(parseISO(courseRealisation.endDate), 'dd.MM.yyyy')

  return `${startDate} - ${endDate}`
}

export const closeCourseImmediately = async (feedbackTarget, difference) => {
  const currentDate = new Date()
  const { id } = feedbackTarget
  const closesAt =
    difference > 1
      ? currentDate
      : set(currentDate, {
          date: currentDate.getDate() + 1,
          hours: 23,
          minutes: 59,
        })

  const payload = {
    closesAt,
  }

  const { data } = await apiClient.put(
    `/feedback-targets/${id}/close-immediately`,
    payload,
  )

  return data
}

export const feedbackCanBeClosed = (feedbackTarget) => {
  const { opensAt } = feedbackTarget
  const openTime = new Date() - new Date(opensAt)

  return openTime >= 86400000
}
