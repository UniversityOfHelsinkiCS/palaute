import React, { useRef, forwardRef, useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Alert, FormControlLabel, Switch } from '@mui/material'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import QuestionResults from './QuestionResults'
import FeedbackResponse from './FeedbackResponse'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'
import OldFeedbackTargetResults from '../OldFeedbackTargetResults'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../common/LoadingProgress'
import FeedbackChart from './QuestionResults/FeedbackChart'
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
    <Alert severity="warning">
      {t('feedbackTargetResults:onlyForEnrolledInfo')}
    </Alert>
  </Box>
)

const FeedbackTargetResultsView = forwardRef((_props, ref) => {
  const { t } = useTranslation()
  const { id } = useParams()
  const isMobile = useIsMobile()

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

  const { feedbackTargetData, isLoading: feedbacksIsLoading } =
    useFeedbackTargetFeedbacks(id)

  const [useLegacy, setUseLegacy] = useState(
    JSON.parse(localStorage.getItem('legacy')) || false,
  )

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
    questionOrder,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
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

  const isTeacher =
    accessStatus === 'TEACHER' ||
    accessStatus === 'RESPONSIBLE_TEACHER' ||
    userOrganisationAdmin
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const enoughFeedbacks = feedbacks?.length > 4 // backend should send 0 when less than 5, but sanity checking

  const saveLegacySetting = (value) => {
    setUseLegacy(value)
    localStorage.setItem('legacy', JSON.stringify(value))
  }

  if (isOpen && !feedback && !userOrganisationAccess && !isTeacher) {
    return <Redirect to={`/targets/${feedbackTarget.id}/feedback`} />
  }

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()

  return (
    <>
      <Box display="flex" alignItems="flex-end" flexDirection="column">
        {enoughFeedbacks && isTeacher && (
          <ExportFeedbacksMenu
            feedbackTarget={feedbackTarget}
            feedbacks={feedbacks}
            componentRef={ref}
          />
        )}
      </Box>

      <Box ref={ref}>
        {feedbackHasStarted && !isOpen && feedbacks.length > 0 && (
          <Box mt={4} mb={2}>
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

        {!isMobile && !useLegacy && (
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

        {!enoughFeedbacks &&
          (feedbackVisible ? (
            <NotEnoughFeedbacks t={t} />
          ) : (
            <OnlyForEnrolled t={t} />
          ))}

        {enoughFeedbacks &&
          (useLegacy ? (
            <Box my="3rem">
              <OldFeedbackTargetResults />
            </Box>
          ) : (
            <Box>
              <QuestionResults
                publicityConfigurableQuestionIds={
                  publicityConfigurableQuestionIds
                }
                publicQuestionIds={publicQuestionIds ?? []}
                questions={questions}
                questionOrder={questionOrder}
                feedbacks={feedbacks}
                isTeacher={isTeacher}
                organisationAccess={!!userOrganisationAccess}
                feedbackCount={feedbackCount}
                feedbackTargetId={id}
              />
            </Box>
          ))}

        {isTeacher && (
          <FormControlLabel
            control={
              <Switch
                checked={useLegacy}
                onClick={() => saveLegacySetting(!useLegacy)}
              />
            }
            label={t('feedbackTargetResults:useLegacyVersion')}
          />
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
