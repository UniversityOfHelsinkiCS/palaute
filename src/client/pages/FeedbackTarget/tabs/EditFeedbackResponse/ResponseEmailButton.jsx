import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { NorButton } from '../../../../components/common/NorButton'

const SubmitResponseDialog = ({ open = false, onClose, onSubmit }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('feedbackResponse:dialogSendEmailTitle')}</DialogTitle>
      <DialogContent>{t('feedbackResponse:dialogSendEmailContent')}</DialogContent>
      <DialogActions>
        <NorButton color="cancel" onClick={onClose}>
          {t('feedbackResponse:dialogCancel')}
        </NorButton>
        <NorButton
          color="primary"
          form="feedback-response-form"
          type="submit"
          data-cy="saveFeedbackResponse"
          onClick={onSubmit}
        >
          {t('feedbackResponse:dialogSendEmailSubmit')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

const ResponseEmailButton = ({ sendEmail, disabled, onSubmit }) => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  const { t } = useTranslation()

  const handleOpenSubmitDialog = () => setSubmitDialogOpen(true)
  const handleCloseSubmitDialog = () => setSubmitDialogOpen(false)

  const handleOpenDialog = () => {
    handleOpenSubmitDialog()
  }

  const handleSubmit = async () => {
    handleCloseSubmitDialog()
    onSubmit()
  }

  return (
    <>
      <SubmitResponseDialog
        open={submitDialogOpen}
        onClose={handleCloseSubmitDialog}
        onSubmit={handleCloseSubmitDialog}
      />
      <Box display="flex" mr={2}>
        <NorButton
          disabled={disabled}
          type="button"
          color="primary"
          onClick={sendEmail ? handleOpenDialog : handleSubmit}
          style={{ width: 130 }}
          data-cy="openFeedbackResponseSubmitDialog"
        >
          {sendEmail ? t('feedbackResponse:dialogSendEmailSubmit') : t('feedbackResponse:dialogSaveSubmit')}
        </NorButton>
      </Box>
    </>
  )
}

export default ResponseEmailButton
