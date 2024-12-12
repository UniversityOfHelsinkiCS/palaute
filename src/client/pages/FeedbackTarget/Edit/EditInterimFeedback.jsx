import React, { useState } from 'react'
import { Edit } from '@mui/icons-material'

import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import { useEditInterimFeedbackMutation } from '../tabs/InterimFeedback/useInterimFeedbackMutation'
import { getInterimFeedbackEditSchema } from '../tabs/InterimFeedback/utils'
import { NorButton } from '../../../components/common/NorButton'
import InterimFeedbackEditor from '../tabs/InterimFeedback/InterimFeedbackEditor'

const EditInterimFeedback = () => {
  const { t } = useTranslation()
  const { id: parentId } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)

  const { feedbackTarget: interimFeedback, isAdmin, isResponsibleTeacher } = useFeedbackTargetContext()
  const allowEdit = isAdmin || isResponsibleTeacher

  const editMutation = useEditInterimFeedbackMutation(parentId)

  if (!allowEdit || !interimFeedback) return null

  const surveyValues = {
    name: interimFeedback.name,
    startDate: interimFeedback.opensAt,
    endDate: interimFeedback.closesAt,
  }

  const interimFeedbackSchema = getInterimFeedbackEditSchema(t)

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async data => {
    const values = {
      fbtId: interimFeedback.id,
      ...data,
    }

    await editMutation.mutateAsync(values, {
      onSuccess: () => {
        handleClose()
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: () => {
        handleClose()
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      },
    })
  }

  return (
    <>
      <NorButton
        sx={{ textAlign: 'left', justifyContent: 'start' }}
        data-cy="feedback-target-edit-interim-feedback"
        onClick={handleClose}
        color="secondary"
        icon={<Edit />}
      >
        {t('interimFeedback:editSurvey')}
      </NorButton>

      <InterimFeedbackEditor
        title={t('interimFeedback:editSurvey')}
        initialValues={surveyValues}
        validationSchema={interimFeedbackSchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
        editView
      />
    </>
  )
}

export default EditInterimFeedback
