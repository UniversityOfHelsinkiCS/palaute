import React, { useRef, forwardRef } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert, useMediaQuery } from '@mui/material'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import QuestionResults from './QuestionResults'
import FeedbackResponse from './FeedbackResponse'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../common/LoadingProgress'
import FeedbackChart from './QuestionResults/FeedbackChart'

const NotEnoughFeedbacks = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning" data-cy="notEnoughFeedbacks">
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

const FeedbackTargetResultsView = forwardRef((_props, ref) => {
  const { t } = useTranslation()
  const { id } = useParams()
  const isMobileChrome =
    useMediaQuery('(max-width:500px)') &&
    navigator.userAgent?.toLowerCase()?.indexOf('chrome') !== -1

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

  const {
    questions,
    publicQuestionIds,
    accessStatus,
    feedback,
    studentCount,
    feedbackCount,
    opensAt,
    closesAt,
    feedbackReminderLastSentAt,
  } = feedbackTarget

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
    <>
      <Box display="flex" alignItems="flex-end" flexDirection="column" mb={2}>
        {feedbacks.length !== 0 && isTeacher && (
          <ExportFeedbacksMenu
            feedbackTarget={feedbackTarget}
            feedbacks={feedbacks}
            componentRef={ref}
          />
        )}
      </Box>

      <Box ref={ref}>
        {feedbackHasStarted && !isOpen && feedbacks.length > 0 && (
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

        {feedbacks.length === 0 &&
          (feedbackVisible ? (
            <NotEnoughFeedbacks t={t} />
          ) : (
            <OnlyForEnrolled t={t} />
          ))}

        {feedbacks.length > 0 && (
          <Box>
            <QuestionResults
              publicQuestionIds={publicQuestionIds ?? []}
              selectPublicQuestionsLink={`/targets/${feedbackTarget.id}/settings`}
              questions={questions}
              feedbacks={feedbacks}
              isTeacher={isTeacher}
              organisationAccess={!!userOrganisationAccess}
              feedbackCount={feedbackCount}
              feedbackTargetId={id}
            />
          </Box>
        )}
      </Box>
    </>
  )
})

const FeedbackTargetResults = () => {
  const componentRef = useRef()

  return (
    <Box>
      <FeedbackTargetResultsView ref={componentRef} />
    </Box>
  )
}

export default FeedbackTargetResults
