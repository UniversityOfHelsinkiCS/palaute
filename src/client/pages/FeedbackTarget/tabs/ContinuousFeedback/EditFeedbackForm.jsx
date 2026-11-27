import { Box } from '@mui/material'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import ConfirmDialog from '../../../../components/common/ConfirmDialog'
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

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [discardConfirmed, setDiscardConfirmed] = useState(false)

  const requestClose = dirty => {
    if (dirty) setDiscardDialogOpen(true)
    else onClose()
  }

  const handleConfirmDiscard = () => {
    setDiscardConfirmed(true)
    setDiscardDialogOpen(false)
  }

  const handleDiscardDialogExited = () => {
    if (discardConfirmed) onClose()
  }

  // Escape cancels the edit, like closing a dialog
  const handleKeyDown = (event, { dirty, isSubmitting }) => {
    if (event.key !== 'Escape') return
    // The Escape dismissed an IME candidate window. Safari reports it with keyCode 229 instead of isComposing.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return

    event.stopPropagation()
    if (isSubmitting) return
    requestClose(dirty)
  }

  return (
    <Formik initialValues={{ feedback }} onSubmit={handleSubmit}>
      {({ values, isSubmitting, dirty }) => (
        <>
          <Box
            component={Form}
            onKeyDown={event => handleKeyDown(event, { dirty, isSubmitting })}
            sx={{ width: '100%', mb: 1 }}
          >
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
              <NorButton color="secondary" onClick={() => requestClose(dirty)} disabled={isSubmitting}>
                {t('common:cancel')}
              </NorButton>
            </Box>
          </Box>
          {/* Rendered outside the form so that Escape inside the dialog doesn't reach the form's key handler */}
          <ConfirmDialog
            open={discardDialogOpen}
            onClose={() => setDiscardDialogOpen(false)}
            onConfirm={handleConfirmDiscard}
            disableRestoreFocus={discardConfirmed}
            onExited={handleDiscardDialogExited}
            title={`${t('feedbackView:discardChanges')}?`}
            content={t('feedbackView:discardChangesConfirmation')}
            confirmLabel={t('feedbackView:discardChanges')}
            confirmColor="error"
            dataCy="continuous-feedback-discard-dialog"
          />
        </>
      )}
    </Formik>
  )
}

export default EditFeedbackForm
