import React, { useState } from 'react'
/** @jsxImportSource @emotion/react */

import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { Box, Card, CardContent, Alert } from '@mui/material'
import { useTranslation, Trans } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'
import FeedbackForm from '../FeedbackTarget/tabs/FeedbackView/FeedbackForm'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import PrivacyDialog from '../FeedbackTarget/tabs/FeedbackView/PrivacyDialog'

import AlertLink from '../../components/common/AlertLink'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'

import {
  makeValidate,
  getInitialValues,
  getQuestions,
  formatDate,
  checkIsFeedbackOpen,
} from '../FeedbackTarget/tabs/FeedbackView/utils'

import { saveValues } from './utils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { NorButton } from '../../components/common/NorButton'

const FormContainer = ({
  onSubmit,
  initialValues,
  onOpenPrivacyDialog,
  validate,
  questions,
  disabled: disabledProp,
  isEdit = false,
}) => {
  const { t } = useTranslation()

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validate={validate} validateOnChange={false}>
      {({ isSubmitting }) => {
        const disabled = isSubmitting || disabledProp

        return (
          <Form>
            <Card>
              <CardContent>
                <Box mb={2}>
                  <Alert severity="info">
                    {t('feedbackView:feedbackInfo')}{' '}
                    <AlertLink href="#feedback-privacy-dialog-title" onClick={onOpenPrivacyDialog}>
                      {t('feedbackView:feedbackInfoLink')}
                    </AlertLink>
                  </Alert>
                </Box>

                <FeedbackForm questions={questions} name="answers" />
              </CardContent>
            </Card>

            <Box mt={2}>
              <NorButton disabled={disabled} color="primary" type="submit" data-cy="feedback-view-give-feedback">
                {isEdit ? t('feedbackView:editButton') : t('feedbackView:submitButton')}
              </NorButton>
            </Box>
          </Form>
        )
      }}
    </Formik>
  )
}

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
  const initialValues = getInitialValues(feedbackTarget)
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
    } catch (e) {
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
