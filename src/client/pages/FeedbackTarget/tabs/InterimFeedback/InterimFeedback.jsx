import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import { Alert, Box } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'

import InterimFeedbackEditor from './InterimFeedbackEditor'
// eslint-disable-next-line import/no-cycle
import InterimFeedbackItem from './InterimFeedbackItem'
import { getInitialInterimFeedbackValues, getInterimFeedbackSchema } from './utils'
import { useInterimFeedbacks } from './useInterimFeedbacks'
import { useCreateInterimFeedbackMutation } from './useInterimFeedbackMutation'

const styles = {
  dates: {
    color: '#646464',
    marginBottom: 3,
  },
  buttonContainer: {
    mb: 2,
    display: 'flex',
    justifyContent: 'flex-start',
    '@media print': {
      display: 'none',
    },
  },
}

const InterimFeedback = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id: parentId } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [showForm, setShowForm] = useState(false)

  const { interimFeedbacks, isLoading: isInterimFeedbacksLoading } = useInterimFeedbacks(parentId)
  const mutation = useCreateInterimFeedbackMutation(parentId)

  if (isInterimFeedbacksLoading) {
    return <LoadingProgress />
  }

  const interimFeedbackSchema = getInterimFeedbackSchema(t)

  const initialValues = getInitialInterimFeedbackValues()

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async values => {
    await mutation.mutateAsync(values, {
      onSuccess: data => {
        handleClose()

        navigate(`/targets/${parentId}/interim-feedback/${data.id}/edit`)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: () => {
        handleClose()
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      },
    })
  }

  return (
    <Box id="feedback-target-tab-content" mb={6} px={1}>
      <Box sx={styles.buttonContainer}>
        <NorButton
          data-cy="interim-feedbacks-add-new"
          color="primary"
          icon={<Add />}
          onClick={() => {
            setShowForm(!showForm)
          }}
          disabled={showForm}
        >
          {t('interimFeedback:addSurvey')}
        </NorButton>
      </Box>

      <InterimFeedbackEditor
        title={t('interimFeedback:addSurvey')}
        initialValues={initialValues}
        validationSchema={interimFeedbackSchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
      />

      {interimFeedbacks.length > 0 ? (
        interimFeedbacks.map(feedback => <InterimFeedbackItem key={feedback.id} interimFeedback={feedback} />)
      ) : (
        <Alert data-cy="interim-feedbacks-no-surveys-alert" sx={{ mt: 2 }} severity="info">
          {t('interimFeedback:emptySurveys')}
        </Alert>
      )}
    </Box>
  )
}

export default InterimFeedback
