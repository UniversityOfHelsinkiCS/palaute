import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@material-ui/core'
import { SendOutlined } from '@material-ui/icons'

import { useTranslation } from 'react-i18next'

const SubmitResponseDialog = ({ open = false, onClose, onSubmit, values }) => {
  const { t } = useTranslation()
  const { sendEmail } = values

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {sendEmail
          ? t('feedbackResponse:dialogSendEmailTitle')
          : t('feedbackResponse:dialogSaveTitle')}
      </DialogTitle>
      <DialogContent>
        {sendEmail
          ? t('feedbackResponse:dialogSendEmailContent')
          : t('feedbackResponse:dialogSaveContent')}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          {t('feedbackResponse:dialogCancel')}
        </Button>
        <Button
          color="primary"
          form="feedback-response-form"
          onClick={onSubmit}
          type="submit"
          data-cy="saveFeedbackResponse"
        >
          {sendEmail
            ? t('feedbackResponse:dialogSendEmailSubmit')
            : t('feedbackResponse:dialogSaveSubmit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ResponseEmailButton = ({ disabled, feedbackTargetId, values }) => {
  const [sent, setSent] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  const { t } = useTranslation()

  const handleOpenSubmitDialog = () => setSubmitDialogOpen(true)
  const handleCloseSubmitDialog = () => setSubmitDialogOpen(false)

  const handleOpenDialog = () => {
    handleOpenSubmitDialog()
  }

  const handleSubmit = async () => {
    setSent(values.sendEmail)
    handleCloseSubmitDialog()
  }

  return (
    <>
      <SubmitResponseDialog
        values={values}
        open={submitDialogOpen}
        onClose={handleCloseSubmitDialog}
        onSubmit={handleSubmit}
      />
      <Box display="flex" mr={2}>
        <Button
          disabled={disabled || sent}
          type="button"
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          style={{ width: 130 }}
          data-cy="openFeedbackResponseSubmitDialog"
        >
          {values.sendEmail
            ? t('feedbackResponse:dialogSendEmailSubmit')
            : t('feedbackResponse:dialogSaveSubmit')}
          <Box mr={1} />
          <SendOutlined fontSize="small" />
        </Button>
      </Box>
    </>
  )
}

export default ResponseEmailButton
