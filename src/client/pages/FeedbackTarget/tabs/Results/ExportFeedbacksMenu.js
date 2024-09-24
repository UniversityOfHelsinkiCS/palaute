import React from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@mui/material'
import { flatMap, keyBy, orderBy } from 'lodash-es'

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
  const sortedQuestions = orderBy(questions, q => orderOfIds.indexOf(q.id))

  const headers = sortedQuestions
    .filter(q => {
      if (!q.data.label) return false
      return true
    })
    .map(q => getLanguageValue(q.data.label, language))

  return headers
}

const getData = (questions, feedbacks, language) => {
  const choiceQuestions = questions.filter(q => ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type))

  // optionIds are not unique, so we need to create unique ids for options by adding questionId to the beginning of the id
  choiceQuestions.forEach(question => {
    if (question.data && question.data.options) {
      question.data.options.forEach(option => {
        option.id = `${question.id}_${option.id}`
      })
    }
  })

  const options = flatMap(choiceQuestions, q => q.data?.options ?? [])

  const optionById = keyBy(options, ({ id }) => id)

  const data = feedbacks.map(f => {
    const feedback = f.data
      .filter(d => questions.find(q => q.id === d.questionId))
      .map(d => {
        const q = questions.find(q => q.id === d.questionId)

        if (['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type)) {
          if (Array.isArray(d.data)) {
            return d.data
              .map(optionId => {
                const questionOptionId = `${q.id}_${optionId}`
                const option = optionById[questionOptionId]
                return getLanguageValue(option?.label, language)
              })
              .join(', ')
          }

          const questionOptionId = `${q.id}_${d.data}`
          const option = optionById[questionOptionId]
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

const ExportXLSXLink = ({ feedbackTarget, feedbacks }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { workbook, filename } = React.useMemo(
    () => createXLSX({ feedbackTarget, feedbacks, language }),
    [feedbacks, feedbackTarget, language]
  )

  return (
    <Button sx={styles.button} onClick={() => writeFileXLSX(workbook, filename)}>
      {t('common:exportXLSX')}
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
      XLSXLink={hasFeedbacks && <ExportXLSXLink feedbackTarget={feedbackTarget} feedbacks={feedbacks} />}
      PdfLink={hasFeedbacks && <ExportPdfLink componentRef={componentRef} />}
      label={t('feedbackTargetResults:export')}
    />
  )
}

export default ExportFeedbacksMenu
