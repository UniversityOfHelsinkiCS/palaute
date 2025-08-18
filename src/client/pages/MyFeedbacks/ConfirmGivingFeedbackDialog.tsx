import React from 'react'
import { Link } from 'react-router-dom'

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import { NorButton } from '../../components/common/NorButton'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../util/common'

type ConfirmGivingFeedbackDialogProps = {
  onClose: () => void
  open?: boolean
}

const ConfirmGivingFeedbackDialog = ({ onClose, open = false }: ConfirmGivingFeedbackDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('userFeedbacks:attention')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: '1rem' }}>
          {t('userFeedbacks:smallCourseWarning', {
            count: FEEDBACK_HIDDEN_STUDENT_COUNT,
          })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <NorButton
          color="secondary"
          to="/feedbacks"
          component={Link}
          sx={{ margin: '0 10px 10px 0' }}
          data-cy="confirm-giving-feedback-dialog-cancel"
        >
          {t('common:cancel')}
        </NorButton>
        <NorButton
          color="primary"
          sx={{ margin: '0 10px 10px 0' }}
          onClick={onClose}
          data-cy="confirm-giving-feedback-dialog-give-feedback"
        >
          {t('userFeedbacks:continue')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmGivingFeedbackDialog
