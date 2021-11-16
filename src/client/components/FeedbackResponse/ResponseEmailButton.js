import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import apiClient from '../../util/apiClient'

const SubmitResponseDialog = ({ open = false, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('feedbackResponse:dialogTitle')}</DialogTitle>
      <DialogContent>{t('feedbackResponse:dialogContent')}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          {t('feedbackResponse:dialogCancel')}
        </Button>
        <Button
          color="primary"
          form="feedback-response-form"
          onClick={onConfirm}
          type="submit"
        >
          {t('feedbackResponse:dialogSubmit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ResponseEmailButton = ({ disabled, feedbackTargetId, values }) => {
  const [sent, setSent] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const handleOpenSubmitDialog = () => setSubmitDialogOpen(true)
  const handleCloseSubmitDialog = () => setSubmitDialogOpen(false)

  const handleOpenDialog = () => {
    handleOpenSubmitDialog()
  }

  const sendEmail = async () => {
    setSent(true)
    handleCloseSubmitDialog()
    const { feedbackResponse } = values
    try {
      await apiClient.put(
        `/feedback-targets/${feedbackTargetId}/notify-students`,
        { data: { feedbackResponseEmailSent: true, feedbackResponse } },
      )
    } catch (err) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <>
      <SubmitResponseDialog
        open={submitDialogOpen}
        onClose={handleCloseSubmitDialog}
        onConfirm={sendEmail}
      />
      <Button
        disabled={disabled || sent}
        type="button"
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
      >
        {t('feedbackResponse:sendEmail')}
      </Button>
    </>
  )
}

export default ResponseEmailButton
