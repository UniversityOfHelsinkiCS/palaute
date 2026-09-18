import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../../components/common/NorButton'

const OpenFeedbackImmediatelyDialog = ({ open = false, onClose, onConfirm }) => {
  const { t } = useTranslation()
  const titleId = useId()

  return (
    <Dialog open={open} onClose={onClose} fullWidth aria-labelledby={titleId}>
      <DialogTitle id={titleId}>{t('editFeedbackTarget:openFeedbackImmediatelyDialogTitle')}</DialogTitle>
      <DialogContent>{t('editFeedbackTarget:openFeedbackImmediatelyDialogContent')}</DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
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
