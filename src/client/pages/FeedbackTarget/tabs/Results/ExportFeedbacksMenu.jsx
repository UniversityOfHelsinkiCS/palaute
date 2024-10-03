import React from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { MenuItem } from '@mui/material'
import { flatMap, keyBy, orderBy } from 'lodash-es'

import ExportButton from '../../../../components/common/ExportButton'
import { getCourseStartDate } from './utils'
import { getLanguageValue } from '../../../../util/languageUtils'

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
  const options = flatMap(questions, q =>
    ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type) ? q.data?.options ?? [] : []
  )

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
                const option = optionById[optionId]
                return getLanguageValue(option?.label, language)
              })
              .join(', ')
          }

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

const ExportXLSXLink = ({ feedbackTarget, feedbacks }) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { workbook, filename } = React.useMemo(
    () => createXLSX({ feedbackTarget, feedbacks, language }),
    [feedbacks, feedbackTarget, language]
  )

  return <MenuItem onClick={() => writeFileXLSX(workbook, filename)}>{t('common:exportXLSX')}</MenuItem>
}

const ExportPdfLink = ({ componentRef }) => {
  const { t } = useTranslation()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: '',
  })

  return <MenuItem onClick={handlePrint}>{t('common:exportPdf')}</MenuItem>
}

const ExportFeedbacksMenu = ({ feedbackTarget, feedbacks, componentRef }) => {
  const { t } = useTranslation()
  const hasFeedbacks = feedbacks?.length > 0

  return (
    <ExportButton disabled={!hasFeedbacks} label={t('feedbackTargetResults:export')}>
      {hasFeedbacks && <ExportXLSXLink feedbackTarget={feedbackTarget} feedbacks={feedbacks} />}
      {hasFeedbacks && <ExportPdfLink componentRef={componentRef} />}
    </ExportButton>
  )
}

export default ExportFeedbacksMenu
