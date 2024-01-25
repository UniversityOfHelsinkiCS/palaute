import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import { Alert, Box, Button } from '@mui/material'

import { useParams, useHistory } from 'react-router-dom'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'

import InterimFeedbackEditor from './InterimFeedbackEditor'
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
  const history = useHistory()
  const { id: parentId } = useParams()
  const { t } = useTranslation()
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

        history.push(`/targets/${parentId}/interim-feedback/${data.id}/edit`)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: () => {
        handleClose()
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      },
    })
  }

  return (
    <Box mb={6} px={1}>
      <Alert sx={{ mb: 2 }} severity="warning">
        {t('interimFeedback:heading')}
      </Alert>
      <Box sx={styles.buttonContainer}>
        <Button
          data-cy="interim-feedbacks-add-new"
          color="primary"
          onClick={() => {
            setShowForm(!showForm)
          }}
          disabled={showForm}
        >
          {t('interimFeedback:addSurvey')}
        </Button>
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
