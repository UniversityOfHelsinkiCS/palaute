import React, { useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Button } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import { differenceInDays, format } from 'date-fns'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import FeedbackSummary from '../QuestionResults/FeedbackSummary'
import QuestionResults from '../QuestionResults'
import Alert from '../Alert'
import FeedbackResponse from './FeedbackResponse'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'
import ReminderEmailModal from './ReminderEmailModal'

import { closeCourseImmediately, feedbackCanBeClosed } from './utils'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../LoadingProgress'

const FeedbackTargetResults = () => {
  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { t } = useTranslation()
  const { id } = useParams()
  const { enqueueSnackbar } = useSnackbar()

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
    feedbackReminderEmailToStudentsSent,
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

  const handleCloseClick = async () => {
    const currentDate = new Date()
    const difference = differenceInDays(
      currentDate,
      new Date(feedbackTarget.opensAt),
    )

    // eslint-disable-next-line no-alert
    const result = window.confirm(
      difference > 1
        ? t('feedbackTargetResults:closeImmediatelyConfirm')
        : t('feedbackTargetResults:closeImmediatelyTomorrowConfirm', {
            date: format(
              currentDate.setDate(currentDate.getDate() + 1),
              'dd.MM.yyyy',
            ),
          }),
    )

    if (result) {
      try {
        await closeCourseImmediately(feedbackTarget, difference)
        window.location.reload()
      } catch (e) {
        enqueueSnackbar(t('unknownError'), { variant: 'error' })
      }
    }
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

  const showCloseImmediately =
    isTeacher && isOpen && feedbackCanBeClosed(feedbackTarget)

  const raiseButton = showCloseImmediately ? { marginTop: -50 } : {}

  return (
    <>
      <ReminderEmailModal
        open={open}
        onClose={closeModal}
        feedbackTarget={feedbackTarget}
      />
      <Box
        display="flex"
        alignItems="flex-end"
        flexDirection="column"
        position="static"
        style={raiseButton}
        mb={2}
      >
        {showCloseImmediately && (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCloseClick}
            >
              {t('feedbackTargetResults:closeImmediately')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={openModal}
              style={{ marginTop: 10 }}
              disabled={feedbackReminderEmailToStudentsSent}
            >
              {t('feedbackTargetResults:sendReminder')}
            </Button>
          </>
        )}
        {feedbacks.length !== 0 && isTeacher && (
          <ExportFeedbacksMenu
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
          selectPublicQuestionsLink={`/targets/${feedbackTarget.id}/feedback-response`}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
          organisationAccess={!!userOrganisationAccess}
        />
      )}
    </>
  )
}

export default FeedbackTargetResults
