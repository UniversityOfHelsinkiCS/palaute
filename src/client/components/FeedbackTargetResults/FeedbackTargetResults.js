import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Typography, Box, CircularProgress } from '@material-ui/core'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import FeedbackSummary from '../QuestionResults/FeedbackSummary'
import QuestionResults from '../QuestionResults'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import FeedbackResponse from './FeedbackResponse'
import { ExportCsvLink, formatCourseDate } from './utils'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'

const FeedbackTargetResults = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

  const { feedbackTargetData, isLoading: feedbacksIsLoading } =
    useFeedbackTargetFeedbacks(id)

  const isLoading = feedbackTargetIsLoading || feedbacksIsLoading

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget || !feedbackTargetData) {
    return <Redirect to="/" />
  }

  const { feedbacks, feedbackVisible } = feedbackTargetData

  const { questions, publicQuestionIds, accessStatus } = feedbackTarget

  const isTeacher = accessStatus === 'TEACHER'
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()

  const notEnoughFeedbacksAlert = (
    <Box mb={2}>
      <Alert severity="warning">
        {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
      </Alert>
    </Box>
  )

  const onlyForEnrolledAlert = (
    <Box mb={2}>
      <Alert severity="warning">
        {t('feedbackTargetResults:onlyForEnrolledInfo')}
      </Alert>
    </Box>
  )

  return (
    <>
      <Box mb={2} display="flex" justifyContent="flex-end">
        {feedbacks.length !== 0 && isTeacher && (
          <ExportCsvLink
            feedbackTarget={feedbackTarget}
            feedbacks={feedbacks}
          />
        )}
      </Box>

      {feedbackHasStarted && !isOpen && (
        <Box mb={2}>
          <FeedbackResponse feedbackTarget={feedbackTarget} />
        </Box>
      )}

      {isOpen && (
        <Box mb={2}>
          <Typography>{t('feedbackTargetResults:thankYouMessage')}</Typography>
        </Box>
      )}

      {feedbacks.length === 0 && feedbackVisible && notEnoughFeedbacksAlert}

      {feedbacks.length === 0 && !feedbackVisible && onlyForEnrolledAlert}

      {feedbacks.length !== 0 && (
        <FeedbackSummary
          publicQuestionIds={publicQuestionIds ?? []}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
        />
      )}

      {feedbacks.length !== 0 && (
        <QuestionResults
          publicQuestionIds={publicQuestionIds ?? []}
          showPublicInfo={isTeacher}
          selectPublicQuestionsLink={`/targets/${feedbackTarget.id}/feedback-response`}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
        />
      )}
    </>
  )
}

export default FeedbackTargetResults
