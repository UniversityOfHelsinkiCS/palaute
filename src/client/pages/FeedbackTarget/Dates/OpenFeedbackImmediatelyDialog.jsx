import { useTranslation } from 'react-i18next'

import ConfirmDialog from '../../../components/common/ConfirmDialog'

const OpenFeedbackImmediatelyDialog = ({ open = false, onClose, onConfirm, disableRestoreFocus }) => {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      disableRestoreFocus={disableRestoreFocus}
      title={t('editFeedbackTarget:openFeedbackImmediatelyDialogTitle')}
      content={t('editFeedbackTarget:openFeedbackImmediatelyDialogContent')}
      cancelLabel={t('editFeedbackTarget:openFeedbackImmediatelyDialogCancel')}
      confirmLabel={t('editFeedbackTarget:openFeedbackImmediatelyDialogConfirm')}
      dataCy="feedback-target-open-feedback-immediately"
    />
  )
}

export default OpenFeedbackImmediatelyDialog
