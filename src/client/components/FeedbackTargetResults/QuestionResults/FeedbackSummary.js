import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  Card,
  TableBody,
} from '@mui/material'

import { getLanguageValue } from '../../../util/languageUtils'

import {
  getQuestionsWithFeedback,
  countAverage,
  countStandardDeviation,
  countMedian,
} from './utils'
import useIsMobile from '../../../hooks/useIsMobile'

const FeedbackSummary = ({
  publicQuestionIds,
  questions,
  feedbacks,
  isTeacher,
}) => {
  const { i18n, t } = useTranslation()
  const isMobile = useIsMobile()

  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks, publicQuestionIds),
    [questions, feedbacks, publicQuestionIds],
  )

  const summaryQuestions = questionsWithFeedbacks.filter(
    (q) =>
      q.type === 'LIKERT' && (isTeacher || publicQuestionIds.includes(q.id)),
  )

  return (
    <TableContainer component={Card}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{t('feedbackSummary:question')}</TableCell>
            <TableCell>{t('feedbackSummary:average')}</TableCell>
            {!isMobile && (
              <TableCell>{t('feedbackSummary:standardDeviation')}</TableCell>
            )}
            {!isMobile && <TableCell>{t('feedbackSummary:median')}</TableCell>}
            <TableCell>{t('feedbackSummary:answers')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summaryQuestions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                {getLanguageValue(question.data.label, i18n.language)}
              </TableCell>
              <TableCell>{countAverage(question.feedbacks)}</TableCell>
              {!isMobile && (
                <TableCell>
                  {countStandardDeviation(question.feedbacks)}
                </TableCell>
              )}
              {!isMobile && (
                <TableCell>{countMedian(question.feedbacks)}</TableCell>
              )}
              <TableCell>{question.feedbacks.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default FeedbackSummary
