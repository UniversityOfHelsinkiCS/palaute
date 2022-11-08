import React, { useRef, forwardRef } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import FeedbackSummary from '../QuestionResults/FeedbackSummary'
import QuestionResults from '../QuestionResults'
import FeedbackResponse from './FeedbackResponse'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../common/LoadingProgress'

const FeedbackTargetResultsView = forwardRef((_props, ref) => {
  const { t } = useTranslation()
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

  const { feedbacks, feedbackVisible, userOrganisationAccess } =
    feedbackTargetData

  const { questions, publicQuestionIds, accessStatus, feedback } =
    feedbackTarget

  const userOrganisationAdmin = userOrganisationAccess
    ? userOrganisationAccess.admin
    : false

  const isTeacher =
    accessStatus === 'TEACHER' ||
    accessStatus === 'RESPONSIBLE_TEACHER' ||
    userOrganisationAdmin
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (isOpen && !feedback && !userOrganisationAccess && !isTeacher) {
    return <Redirect to={`/targets/${feedbackTarget.id}/feedback`} />
  }

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
    <span ref={ref}>
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

      {feedbacks.length === 0 && feedbackVisible && notEnoughFeedbacksAlert}

      {feedbacks.length === 0 && !feedbackVisible && onlyForEnrolledAlert}

      {feedbacks.length !== 0 && (
        <Box mb={2}>
          <FeedbackSummary
            publicQuestionIds={publicQuestionIds ?? []}
            questions={questions}
            feedbacks={feedbacks}
            isTeacher={isTeacher}
          />
        </Box>
      )}

      {feedbacks.length !== 0 && (
        <QuestionResults
          publicQuestionIds={publicQuestionIds ?? []}
          selectPublicQuestionsLink={`/targets/${feedbackTarget.id}/settings`}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
          organisationAccess={!!userOrganisationAccess}
        />
      )}
    </span>
  )
})

const FeedbackTargetResults = () => {
  const componentRef = useRef()

  return <FeedbackTargetResultsView ref={componentRef} />
}

export default FeedbackTargetResults
