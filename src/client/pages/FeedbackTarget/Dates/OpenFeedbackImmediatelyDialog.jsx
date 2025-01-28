import React from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { NorButton } from '../../../components/common/NorButton'

const OpenFeedbackImmediatelyDialog = ({ open = false, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('editFeedbackTarget:openFeedbackImmediatelyDialogTitle')}</DialogTitle>
      <DialogContent>{t('editFeedbackTarget:openFeedbackImmediatelyDialogContent')}</DialogContent>
      <DialogActions>
        <NorButton data-cy="feedback-target-open-feedback-immediately-cancel" color="cancel" onClick={onClose}>
          {t('editFeedbackTarget:openFeedbackImmediatelyDialogCancel')}
        </NorButton>
        <NorButton data-cy="feedback-target-open-feedback-immediately-confirm" color="primary" onClick={onConfirm}>
          {t('editFeedbackTarget:openFeedbackImmediatelyDialogConfirm')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default OpenFeedbackImmediatelyDialog
