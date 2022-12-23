import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import useOrganisationAccess from '../../hooks/useOrganisationAccess'
import FeedbackSummary from './QuestionResults/FeedbackSummary'
import QuestionResults from './QuestionResults'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../common/LoadingProgress'

const OldFeedbackTargetResultsView = () => {
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

  const orgAccess = useOrganisationAccess(feedbackTarget)

  const { feedbacks, feedbackVisible } = feedbackTargetData

  const { questions, publicQuestionIds, accessStatus, feedback } =
    feedbackTarget

  const userOrganisationAdmin = orgAccess?.admin ? orgAccess.admin : false

  const isResponsibleTeacher =
    userOrganisationAdmin || accessStatus === 'RESPONSIBLE_TEACHER'
  const isTeacher = isResponsibleTeacher || accessStatus === 'TEACHER'

  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (isOpen && !feedback && !orgAccess.read && !isTeacher) {
    return <Redirect to={`/targets/${feedbackTarget.id}/feedback`} />
  }

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
            isResponsibleTeacher={isResponsibleTeacher}
          />
        </Box>
      )}

      {feedbacks.length !== 0 && (
        <QuestionResults
          publicQuestionIds={publicQuestionIds ?? []}
          questions={questions}
          feedbacks={feedbacks}
          isResponsibleTeacher={isResponsibleTeacher}
          organisationAccess={orgAccess.read}
        />
      )}
    </>
  )
}

export default OldFeedbackTargetResultsView
