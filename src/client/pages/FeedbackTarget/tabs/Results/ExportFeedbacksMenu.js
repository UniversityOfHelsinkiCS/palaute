import React from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@mui/material'
import * as _ from 'lodash'

import ExportButton from '../../../../components/common/ExportButton'
import { getCourseStartDate } from './utils'
import { getLanguageValue } from '../../../../util/languageUtils'

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

const getHeaders = (questions, feedbacks, language) => {
  const orderOfIds = feedbacks[0].data.map(f => f.questionId)
  const sortedQuestions = _.orderBy(questions, q => orderOfIds.indexOf(q.id))

  const headers = sortedQuestions
    .filter(q => {
      if (!q.data.label) return false
      return true
    })
    .map(q => getLanguageValue(q.data.label, language))

  return headers
}

const getData = (questions, feedbacks, language) => {
  const options = _.flatMap(questions, q =>
    ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type) ? q.data?.options ?? [] : []
  )

  const optionById = _.keyBy(options, ({ id }) => id)

  const data = feedbacks.map(f => {
    const feedback = f.data
      .filter(d => questions.find(q => q.id === d.questionId))
      .map(d => {
        const q = questions.find(q => q.id === d.questionId)

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

const createXLSX = ({ feedbackTarget, feedbacks, language }) => {
  const headers = getHeaders(feedbackTarget.questions, feedbacks, language)
  const questions = getData(feedbackTarget.questions, feedbacks, language)

  const data = [headers, ...questions]

  const filename = `${feedbackTarget.courseUnit.courseCode}_${getCourseStartDate(feedbackTarget)}`

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, filename)

  return { workbook, filename: `${filename}.xlsx` }
}

const ExportCsvLink = ({ feedbackTarget, feedbacks }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { workbook, filename } = React.useMemo(
    () => createXLSX({ feedbackTarget, feedbacks, language }),
    [feedbacks, feedbackTarget, language]
  )

  return (
    <Button sx={styles.button} onClick={() => writeFileXLSX(workbook, filename)}>
      {t('common:exportCsv')}
    </Button>
  )
}

const ExportPdfLink = ({ componentRef }) => {
  const { t } = useTranslation()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: '',
  })

  return (
    <Button sx={styles.button} onClick={handlePrint}>
      {t('common:exportPdf')}
    </Button>
  )
}

const ExportFeedbacksMenu = ({ feedbackTarget, feedbacks, componentRef }) => {
  const { t } = useTranslation()
  const hasFeedbacks = feedbacks?.length > 0

  return (
    <ExportButton
      disabled={!hasFeedbacks}
      CsvLink={hasFeedbacks && <ExportCsvLink feedbackTarget={feedbackTarget} feedbacks={feedbacks} />}
      PdfLink={hasFeedbacks && <ExportPdfLink componentRef={componentRef} />}
      label={t('feedbackTargetResults:export')}
    />
  )
}

export default ExportFeedbacksMenu
