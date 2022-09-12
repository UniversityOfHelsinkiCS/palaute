import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import FeedbackSummary from './QuestionResults/FeedbackSummary'
import QuestionResults from './QuestionResults'
import FeedbackResponse from './FeedbackResponse'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../LoadingProgress'
import FeedbackChart from './QuestionResults/FeedbackChart'

const NotEnoughFeedbacks = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning">
      {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
    </Alert>
  </Box>
)

const OnlyForEnrolled = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning">
      {t('feedbackTargetResults:onlyForEnrolledInfo')}
    </Alert>
  </Box>
)

const FeedbackTargetResults = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

  const { feedbackTargetData, isLoading: feedbacksIsLoading } =
    useFeedbackTargetFeedbacks(id)

  const isLoading = feedbackTargetIsLoading || feedbacksIsLoading

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget || !feedbackTargetData) {
    return <Redirect to="/" />
  }

  const {
    feedbacks,
    feedbackVisible,
    userOrganisationAccess,
    opensAt,
    closesAt,
  } = feedbackTargetData

  const { questions, publicQuestionIds, accessStatus, feedback } =
    feedbackTarget

  const userOrganisationAdmin = userOrganisationAccess
    ? userOrganisationAccess.admin
    : false

  const isTeacher = accessStatus === 'TEACHER' || userOrganisationAdmin
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (isOpen && !feedback && !userOrganisationAccess && !isTeacher) {
    return <Redirect to={`/targets/${feedbackTarget.id}/feedback`} />
  }

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()

  return (
    <Box>
      {feedbackHasStarted && !isOpen && (
        <Box mb={2}>
          <FeedbackResponse feedbackTarget={feedbackTarget} />
        </Box>
      )}

      {isOpen && feedback && (
        <Box mb={2}>
          <Alert severity="info">
            {t('feedbackTargetResults:thankYouMessage')}
          </Alert>
        </Box>
      )}

      {feedbacks.length === 0 &&
        (feedbackVisible ? <NotEnoughFeedbacks /> : <OnlyForEnrolled />)}

      <Box>
        <FeedbackChart
          feedbacks={feedbacks}
          opensAt={opensAt}
          closesAt={closesAt}
        />
      </Box>

      <Box>
        <QuestionResults
          publicQuestionIds={publicQuestionIds ?? []}
          selectPublicQuestionsLink={`/targets/${feedbackTarget.id}/settings`}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
          organisationAccess={!!userOrganisationAccess}
        />
      </Box>
    </Box>
  )
}

export default FeedbackTargetResults
