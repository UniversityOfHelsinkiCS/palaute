import React from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

import { useTranslation } from 'react-i18next'

const OpenFeedbackImmediatelyDialog = ({ open = false, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('editFeedbackTarget:openFeedbackImmediatelyDialogTitle')}</DialogTitle>
      <DialogContent>{t('editFeedbackTarget:openFeedbackImmediatelyDialogContent')}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          {t('editFeedbackTarget:openFeedbackImmediatelyDialogCancel')}
        </Button>
        <Button color="primary" onClick={onConfirm}>
          {t('editFeedbackTarget:openFeedbackImmediatelyDialogConfirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OpenFeedbackImmediatelyDialog
