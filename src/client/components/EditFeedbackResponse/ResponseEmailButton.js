import React, { useState } from 'react'
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

const SubmitResponseDialog = ({ open = false, onClose, onSubmit }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('feedbackResponse:dialogSendEmailTitle')}</DialogTitle>
      <DialogContent>
        {t('feedbackResponse:dialogSendEmailContent')}
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
          {t('feedbackResponse:dialogSendEmailSubmit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ResponseEmailButton = ({ isSent, disabled, onSubmit }) => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  const { t } = useTranslation()

  const handleOpenSubmitDialog = () => setSubmitDialogOpen(true)
  const handleCloseSubmitDialog = () => setSubmitDialogOpen(false)

  const handleOpenDialog = () => {
    handleOpenSubmitDialog()
  }

  const handleSubmit = async () => {
    onSubmit()
    handleCloseSubmitDialog()
  }

  return (
    <>
      <SubmitResponseDialog
        open={submitDialogOpen}
        onClose={handleCloseSubmitDialog}
        onSubmit={handleSubmit}
      />
      <Box display="flex" mr={2}>
        <Button
          disabled={disabled}
          type="button"
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          style={{ width: 130 }}
          data-cy="openFeedbackResponseSubmitDialog"
        >
          {isSent
            ? t('feedbackResponse:emailSent')
            : t('feedbackResponse:dialogSendEmailSubmit')}
          <Box mr={1} />
          <SendOutlined fontSize="small" />
        </Button>
      </Box>
    </>
  )
}

export default ResponseEmailButton
