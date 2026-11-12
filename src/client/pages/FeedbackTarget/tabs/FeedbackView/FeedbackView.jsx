import { Box, Alert } from '@mui/material'
/** @jsxImportSource @emotion/react */
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'

import AlertLink from '../../../../components/common/AlertLink'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import { SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING, FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import { QuestionLanguageProvider } from '../../../../util/questionLanguageContext'
import ConfirmGivingFeedbackDialog from '../../../MyFeedbacks/ConfirmGivingFeedbackDialog'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import FormContainer from './FormContainer'
import PrivacyDialog from './PrivacyDialog'
import Toolbar from './Toolbar'
import { makeValidate, getInitialValues, getQuestions, formatDate, checkIsFeedbackOpen, useSaveValues } from './utils'

const FeedbackView = ({ questionsUneditableInfo }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams()
  const { authorizedUser } = useAuthorizedUser()

  const submitMutation = useSaveValues()
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)
  const [smallCourseDialogOpen, setSmallCourseDialogOpen] = useState(true)

  const { feedbackTarget, isStudent, isOrganisationAdmin, isTeacher, isLoading, previewLanguage, setPreviewLanguage } =
    useFeedbackTargetContext()
  const studentCount = feedbackTarget.summary?.data?.studentCount

  if (isLoading) {
    return <LoadingProgress />
  }
  const { accessStatus, opensAt, closesAt, feedback, continuousFeedbackEnabled } = feedbackTarget

  const isOutsider = accessStatus.includes('NONE')
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOngoing = !isOpen && !isEnded

  if (isStudent && isOngoing && continuousFeedbackEnabled) {
    return <Navigate to={`/targets/${id}/continuous-feedback`} replace />
  }

  const showClosedAlert = isOngoing
  const showForm = isOrganisationAdmin || isTeacher || isOpen || isEnded
  const formIsDisabled = !isOpen || isTeacher || isOutsider || isOrganisationAdmin
  const showToolbar = (isOrganisationAdmin || isTeacher) && !isOpen && !isEnded
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

  const handleLanguageChange = lang => {
    setPreviewLanguage(lang)
  }

  return (
    <QuestionLanguageProvider value={previewLanguage}>
      <Box id="feedback-target-tab-content">
        <PrivacyDialog open={privacyDialogOpen} onClose={handleClosePrivacyDialog} />

        {isStudent && studentCount < FEEDBACK_HIDDEN_STUDENT_COUNT && (
          <ConfirmGivingFeedbackDialog open={smallCourseDialogOpen} onClose={() => setSmallCourseDialogOpen(false)} />
        )}

        {showClosedAlert && closedAlert}

        {isEnded && endedAlert}

        {showForm && (
          <FormContainer
            inTabPanel
            initialValues={initialValues}
            validate={validate}
            onSubmit={handleSubmit}
            disabled={formIsDisabled && !authorizedUser?.isAdmin}
            showSubmitButton={!isTeacher || authorizedUser?.isAdmin}
            questions={questions}
            showCannotSubmitText={isOutsider}
            onOpenPrivacyDialog={handleOpenPrivacyDialog}
            isEdit={Boolean(feedback)}
            fewEnrolled={studentCount < FEEDBACK_HIDDEN_STUDENT_COUNT}
          />
        )}

        {questionsUneditableInfo && (
          <Alert severity="warning" role="presentation" sx={{ mt: 2 }}>
            {questionsUneditableInfo}
          </Alert>
        )}

        {showToolbar && (
          <Box sx={{ mt: 2 }}>
            <Toolbar language={previewLanguage} onLanguageChange={handleLanguageChange} />
          </Box>
        )}
      </Box>
    </QuestionLanguageProvider>
  )
}

export default FeedbackView
