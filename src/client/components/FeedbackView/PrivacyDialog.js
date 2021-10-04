import React from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

const PrivacyDialog = ({ open, onClose }) => {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="feedback-privacy-dialog-title"
      aria-describedby="feedback-privacy-dialog-description"
    >
      <DialogTitle id="feedback-privacy-dialog-title">
        {t('feedbackView:feedbackInfoTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="feedback-privacy-dialog-description">
          {t('feedbackView:feedbackInfoContent')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrivacyDialog
