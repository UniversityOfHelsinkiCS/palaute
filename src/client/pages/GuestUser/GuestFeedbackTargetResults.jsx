import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import QuestionResults from '../FeedbackTarget/tabs/Results/QuestionResults'
import FeedbackResponse from '../FeedbackTarget/tabs/Results/FeedbackResponse'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import FeedbackChart from '../FeedbackTarget/tabs/Results/QuestionResults/FeedbackChart'
import useIsMobile from '../../hooks/useIsMobile'

const NotEnoughFeedbacks = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning" data-cy="notEnoughFeedbacks">
      {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
    </Alert>
  </Box>
)

const OnlyForEnrolled = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning">{t('feedbackTargetResults:onlyForEnrolledInfo')}</Alert>
  </Box>
)

const FeedbackTargetResultsView = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const isMobileChrome = useIsMobile() && navigator.userAgent?.toLowerCase()?.indexOf('chrome') !== -1

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } = useFeedbackTarget(id)

  const { feedbackTargetData, isLoading: feedbacksIsLoading } = useFeedbackTargetFeedbacks(id)

  const isLoading = feedbackTargetIsLoading || feedbacksIsLoading

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget || !feedbackTargetData) {
    return <Navigate to="/noad/feedbacks" />
  }

  const { feedbacks, feedbackVisible } = feedbackTargetData

  const { questions, publicQuestionIds, feedback, summary, opensAt, closesAt, feedbackReminderLastSentAt } =
    feedbackTarget

  const feedbackCount = summary?.data?.feedbackCount ?? 0
  const studentCount = summary?.data?.studentCount ?? 0

  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (isOpen && !feedback) {
    return <Navigate to={`noad/targets/${feedbackTarget.id}/feedback`} />
  }

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()

  return (
    <Box>
      {feedbackHasStarted && !isOpen && feedbacks.length > 0 && (
        <Box mb={2}>
          <FeedbackResponse feedbackTarget={feedbackTarget} />
        </Box>
      )}

      {isOpen && feedback && (
        <Box mb={2}>
          <Alert severity="info">{t('feedbackTargetResults:thankYouMessage')}</Alert>
        </Box>
      )}

      {!isMobileChrome && (
        <Box>
          <FeedbackChart
            feedbacks={feedbacks}
            studentCount={studentCount}
            opensAt={opensAt}
            closesAt={closesAt}
            feedbackReminderLastSentAt={feedbackReminderLastSentAt}
            t={t}
          />
        </Box>
      )}

      {feedbacks.length === 0 && (feedbackVisible ? <NotEnoughFeedbacks t={t} /> : <OnlyForEnrolled t={t} />)}

      {feedbacks.length > 0 && (
        <Box>
          <QuestionResults
            publicQuestionIds={publicQuestionIds ?? []}
            questions={questions}
            feedbacks={feedbacks}
            isResponsibleTeacher={false}
            isOpen={isOpen}
            organisationAccess={false}
            feedbackCount={feedbackCount}
            feedbackTargetId={id}
          />
        </Box>
      )}
    </Box>
  )
}

const GuestFeedbackTargetResults = () => (
  <Box>
    <FeedbackTargetResultsView />
  </Box>
)

export default GuestFeedbackTargetResults
