import { Box } from '@mui/material'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import FormikTextField from '../../../../components/common/FormikTextField'
import { NorButton } from '../../../../components/common/NorButton'
import { editContinuousFeedback } from './utils'

const EditFeedbackForm = ({ feedbackId, feedback, onClose, refetch }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const { id } = useParams()

  const handleSubmit = async values => {
    try {
      await editContinuousFeedback(values.feedback, id, feedbackId)
      await refetch()
      onClose()
      enqueueSnackbar(t('feedbackTargetView:continuousFeedbackEditSuccessAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  // Escape cancels the edit, like closing a dialog
  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  return (
    <Formik initialValues={{ feedback }} onSubmit={handleSubmit}>
      {({ values, isSubmitting }) => (
        <Box component={Form} onKeyDown={handleKeyDown} sx={{ width: '100%', mb: 1 }}>
          <FormikTextField
            id={`edit-continuous-feedback-${feedbackId}`}
            name="feedback"
            label={t('feedbackTargetView:editContinuousFeedbackField')}
            fullWidth
            minRows={4}
            multiline
            // The user opened the form by pressing Edit, which is removed while editing, so focus must move here
            // oxlint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onFocus={event => {
              // Place the caret at the end of the text instead of selecting or starting at the beginning
              const { length } = event.target.value
              event.target.setSelectionRange(length, length)
            }}
            data-cy="editContinuousFeedbackInput"
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <NorButton
              type="submit"
              color="primary"
              disabled={!values.feedback.trim() || values.feedback === feedback || isSubmitting}
              data-cy="saveContinuousFeedbackEdit"
            >
              {t('common:save')}
            </NorButton>
            <NorButton color="secondary" onClick={onClose} disabled={isSubmitting}>
              {t('common:cancel')}
            </NorButton>
          </Box>
        </Box>
      )}
    </Formik>
  )
}

export default EditFeedbackForm
