import { Alert, Box } from '@mui/material'
import { isAxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import ConfirmDialog from '../../../../components/common/ConfirmDialog'
import FormikTextField from '../../../../components/common/FormikTextField'
import { NorButton } from '../../../../components/common/NorButton'
import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import { clearDraft, getDraftKey } from '../FeedbackView/utils'
import DraftSaver, { loadFeedbackDraft } from './DraftSaver'
import { editContinuousFeedback } from './utils'

const EditFeedbackForm = ({ feedbackId, feedback, onClose: closeForm, refetch }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const { id } = useParams()
  const { authorizedUser } = useAuthorizedUser()

  const draftKey = authorizedUser ? getDraftKey(authorizedUser.id, `continuous:${id}:edit:${feedbackId}`) : null
  // Read once when the form mounts: Formik only uses initialValues on its first render
  const [initialFeedback] = useState(() => loadFeedbackDraft(draftKey) ?? feedback)

  const onClose = () => {
    if (draftKey) clearDraft(draftKey)
    closeForm()
  }

  // Translation key of the reason the server refused the edit. The form then stays open as read-only so the
  // student can still copy their text.
  const [refusal, setRefusal] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (refusal) inputRef.current?.focus()
  }, [refusal])

  const handleSubmit = async values => {
    try {
      await editContinuousFeedback(values.feedback, id, feedbackId)
      await refetch()
      onClose()
      enqueueSnackbar(t('feedbackTargetView:continuousFeedbackEditSuccessAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined

      if (status === 409) {
        setRefusal('feedbackTargetView:continuousFeedbackEditRefusedResponded')
        void refetch()
      } else if (status === 403 || status === 404) {
        setRefusal('feedbackTargetView:continuousFeedbackEditRefused')
      } else {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
    }
  }

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [discardConfirmed, setDiscardConfirmed] = useState(false)

  const requestClose = dirty => {
    if (dirty && !refusal) setDiscardDialogOpen(true)
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
    <Formik initialValues={{ feedback: initialFeedback }} onSubmit={handleSubmit}>
      {({ values, isSubmitting }) => {
        // Compared with the saved feedback instead of Formik's dirty, because a restored draft is the form's initial value
        const dirty = values.feedback !== feedback

        return (
          <>
            <Box
              component={Form}
              onKeyDown={event => handleKeyDown(event, { dirty, isSubmitting })}
              sx={{ width: '100%', mb: 1 }}
            >
              {draftKey && !refusal && <DraftSaver draftKey={draftKey} unchangedValue={feedback} />}
              {refusal && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {t(refusal)}
                </Alert>
              )}
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
                inputRef={inputRef}
                slotProps={{ input: { readOnly: Boolean(refusal) } }}
                data-cy="editContinuousFeedbackInput"
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {!refusal && (
                  <NorButton
                    type="submit"
                    color="primary"
                    disabled={!values.feedback.trim() || values.feedback === feedback || isSubmitting}
                    data-cy="saveContinuousFeedbackEdit"
                  >
                    {t('common:save')}
                  </NorButton>
                )}
                <NorButton color="secondary" onClick={() => requestClose(dirty)} disabled={isSubmitting}>
                  {refusal ? t('common:close') : t('common:cancel')}
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
        )
      }}
    </Formik>
  )
}

export default EditFeedbackForm
