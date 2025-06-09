import React, { useState } from 'react'
/** @jsxImportSource @emotion/react */

import { useParams, useNavigate, Link } from 'react-router-dom'

import { Typography, Box, Card, CardContent, Alert } from '@mui/material'
import { useTranslation, Trans } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'
import { NorButton } from '../../../../components/common/NorButton'
import FormikCheckbox from '../../../../components/common/FormikCheckbox'

import ContinuousFeedback from './ContinuousFeedback'
import FeedbackForm from './FeedbackForm'
import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import PrivacyDialog from './PrivacyDialog'
import Toolbar from './Toolbar'
import AlertLink from '../../../../components/common/AlertLink'

import { makeValidate, getInitialValues, getQuestions, formatDate, checkIsFeedbackOpen, useSaveValues } from './utils'

import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import { SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING } from '../../../../util/common'

const FormContainer = ({
  onSubmit,
  initialValues,
  onOpenPrivacyDialog,
  validate,
  questions,
  disabled: disabledProp,
  showCannotSubmitText = false,
  showSubmitButton = true,
  isEdit = false,
  lessThanFiveEnrolled,
}) => {
  const { t } = useTranslation()

  return (
    <Formik
      initialValues={{ ...initialValues, activateSubmit: false }}
      onSubmit={onSubmit}
      validate={validate}
      validateOnChange={false}
    >
      {({ values, isSubmitting, setFieldValue }) => {
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

            {showSubmitButton && (
              <Box mt={2}>
                <NorButton
                  data-cy="feedback-view-give-feedback"
                  disabled={disabled || (lessThanFiveEnrolled && !values.activateSubmit)}
                  color="secondary"
                  variant="contained"
                  type="submit"
                >
                  {isEdit ? t('feedbackView:editButton') : t('feedbackView:submitButton')}
                </NorButton>
                {lessThanFiveEnrolled && (
                  <FormikCheckbox
                    name="activateSubmit"
                    label={t('feedbackView:allowSubmitCheckbox')}
                    onChange={({ target }) => {
                      setFieldValue('activateSubmit', target.checked)
                    }}
                    sx={{ ml: '1rem' }}
                  />
                )}
                {showCannotSubmitText && (
                  <Box mt={1}>
                    <Typography color="textSecondary">{t('feedbackView:cannotSubmitText')}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Form>
        )
      }}
    </Formik>
  )
}

const FeedbackView = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { id, interimFeedbackId } = useParams()
  const { authorizedUser } = useAuthorizedUser()

  const submitMutation = useSaveValues()
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)

  const { feedbackTarget, isStudent, isResponsibleTeacher, isOrganisationAdmin, isTeacher } = useFeedbackTargetContext()
  const studentCount = feedbackTarget.summary?.data?.studentCount
  const isLoading = !feedbackTarget

  if (isLoading) {
    return <LoadingProgress />
  }

  const { language } = i18n
  const { accessStatus, opensAt, closesAt, feedback, continuousFeedbackEnabled } = feedbackTarget

  const isOutsider = accessStatus.includes('NONE')
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOngoing = !isOpen && !isEnded
  const showContinuousFeedback = isStudent && isOngoing && continuousFeedbackEnabled
  const showClosedAlert = isOngoing && !showContinuousFeedback
  const showForm = isOrganisationAdmin || isTeacher || isOpen || isEnded
  const formIsDisabled = !isOpen || isTeacher || isOutsider || isOrganisationAdmin
  const showToolbar = (isOrganisationAdmin || isTeacher) && !isOpen && !isEnded
  const questions = getQuestions(feedbackTarget)
  const initialValues = getInitialValues(feedbackTarget)
  const validate = makeValidate(questions)

  const editLink = interimFeedbackId
    ? `/targets/${id}/interim-feedback/${interimFeedbackId}/edit`
    : `/targets/${id}/edit`

  const handleSubmit = async values => {
    try {
      if (checkIsFeedbackOpen(closesAt)) {
        enqueueSnackbar(t('feedbackView:feedbackClosedError'), {
          variant: 'error',
        })
      } else {
        const feedbackData = Object.entries(values.answers).map(([questionId, data]) => ({
          questionId: Number(questionId),
          data,
        }))

        await submitMutation.mutateAsync(feedbackData)

        if (SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING) {
          navigate(`/feedbacks?status=given`)
        } else {
          navigate(`/targets/${id}/results`)
        }

        enqueueSnackbar(t('feedbackView:successAlert'), {
          variant: 'success',
          autoHideDuration: 6000,
        })
      }
    } catch (e) {
      if (e?.response?.data?.error) {
        enqueueSnackbar(e.response.data.error, { variant: 'error' })
      } else {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
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
          <AlertLink component={Link} to={`/targets/${feedbackTarget.id}/results`}>
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

  const handleLanguageChange = language => {
    i18n.changeLanguage(language)
  }

  return (
    <>
      <PrivacyDialog open={privacyDialogOpen} onClose={handleClosePrivacyDialog} />

      {showContinuousFeedback && <ContinuousFeedback />}

      {showClosedAlert && closedAlert}

      {isEnded && endedAlert}

      {showForm && (
        <FormContainer
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
          disabled={formIsDisabled && !authorizedUser?.isAdmin}
          showSubmitButton={!isTeacher || authorizedUser?.isAdmin}
          questions={questions}
          showCannotSubmitText={isOutsider}
          onOpenPrivacyDialog={handleOpenPrivacyDialog}
          isEdit={Boolean(feedback)}
          lessThanFiveEnrolled={studentCount < 5}
        />
      )}

      {showToolbar && (
        <Box mt={2}>
          <Toolbar
            showEdit={isResponsibleTeacher}
            editLink={editLink}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </Box>
      )}
    </>
  )
}

export default FeedbackView
