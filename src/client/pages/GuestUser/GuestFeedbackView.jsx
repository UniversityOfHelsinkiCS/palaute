import { Box, Alert } from '@mui/material'
/** @jsxImportSource @emotion/react */
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'

import AlertLink from '../../components/common/AlertLink'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import FormContainer from '../FeedbackTarget/tabs/FeedbackView/FormContainer'
import PrivacyDialog from '../FeedbackTarget/tabs/FeedbackView/PrivacyDialog'
import {
  makeValidate,
  getInitialValues,
  getQuestions,
  formatDate,
  checkIsFeedbackOpen,
} from '../FeedbackTarget/tabs/FeedbackView/utils'
import { saveValues } from './utils'

const GuestFeedbackView = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget) {
    return <Navigate to="/noad/courses" />
  }

  const { opensAt, closesAt, feedback } = feedbackTarget
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  const showForm = isOpen || isEnded
  const formIsDisabled = !isOpen
  const questions = getQuestions(feedbackTarget)
  const initialValues = getInitialValues(questions, feedbackTarget.feedback)
  const validate = makeValidate(questions)

  const handleSubmit = async values => {
    try {
      if (checkIsFeedbackOpen(closesAt)) {
        enqueueSnackbar(t('feedbackView:feedbackClosedError'), {
          variant: 'error',
        })
      } else {
        await saveValues(values, feedbackTarget)

        navigate(`/noad/targets/${id}/results`)

        enqueueSnackbar(t('feedbackView:successAlert'), {
          variant: 'success',
          autoHideDuration: 6000,
        })
      }
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const closedAlert = (
    <Box mb={2}>
      <Alert severity="warning">
        {t('feedbackView:closedInfo', {
          opensAt: formatDate(new Date(opensAt)),
          closesAt: formatDate(new Date(closesAt)),
        })}
      </Alert>
    </Box>
  )

  const endedAlert = (
    <Box mb={2}>
      <Alert severity="info">
        <Trans i18nKey="feedbackView:endedInfo">
          The feedback period has ended.{' '}
          <AlertLink component={Link} to={`/noad/targets/${feedbackTarget.id}/results`}>
            Take a look at the feedbacks
          </AlertLink>
        </Trans>
      </Alert>
    </Box>
  )

  const handleClosePrivacyDialog = () => {
    setPrivacyDialogOpen(false)
  }

  const handleOpenPrivacyDialog = event => {
    event.preventDefault()
    setPrivacyDialogOpen(true)
  }

  return (
    <>
      <PrivacyDialog open={privacyDialogOpen} onClose={handleClosePrivacyDialog} />

      {!isOpen && !isEnded && closedAlert}

      {isEnded && endedAlert}

      {showForm && (
        <FormContainer
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
          disabled={formIsDisabled}
          questions={questions}
          onOpenPrivacyDialog={handleOpenPrivacyDialog}
          isEdit={Boolean(feedback)}
        />
      )}
    </>
  )
}

export default GuestFeedbackView
