import React from 'react'
import { writeFileXLSX, utils } from 'xlsx'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { MenuItem } from '@mui/material'
import { flatMap, keyBy, orderBy } from 'lodash-es'

import ExportButton from '../../../../components/common/ExportButton'
import { getCourseStartDate } from './utils'
import { getLanguageValue } from '../../../../util/languageUtils'
import { getSafeCourseCode } from '../../../../util/courseIdentifiers'

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
  //Filter to choice questions only
  const choiceQuestions = questions.filter(q => ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(q.type))

  // optionIds are not unique, so we need to create unique ids for options by adding questionId to the beginning of the id and set it as questionOptionId
  const updatedChoiceQuestions = choiceQuestions.map(question => {
    if (question.data && question.data.options) {
      const newOptions = question.data.options.map(option => ({
        ...option,
        questionOptionId: `${question.id}_${option.id}`,
      }))

      return {
        ...question,
        data: {
          ...question.data,
          options: newOptions,
        },
      }
    }

    return { ...question }
  })

  const options = flatMap(updatedChoiceQuestions, q => q.data?.options ?? [])

  const optionById = keyBy(options, ({ questionOptionId }) => questionOptionId)

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

  const safeCourseCode = getSafeCourseCode({
    courseCode: feedbackTarget?.courseUnit?.courseCode,
    forUrl: false,
  })

  const filename = `${safeCourseCode}_${getCourseStartDate(feedbackTarget)}`

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
    contentRef: componentRef,
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
