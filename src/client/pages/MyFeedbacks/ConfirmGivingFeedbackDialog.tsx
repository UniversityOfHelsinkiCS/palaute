import React from 'react'
import { Link } from 'react-router-dom'

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import { NorButton } from '../../components/common/NorButton'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../util/common'

type ConfirmGivingFeedbackDialogProps = {
  onClose: () => void
  editPath: string
  open?: boolean
}

const ConfirmGivingFeedbackDialog = ({ onClose, editPath, open = false }: ConfirmGivingFeedbackDialogProps) => {
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
        <NorButton color="secondary" to={editPath} component={Link} sx={{ mr: '1rem' }}>
          {t('userFeedbacks:giveFeedbackButton')}
        </NorButton>
      </DialogContent>
      <DialogActions>
        <NorButton color="primary" sx={{ margin: '0 10px 10px 0' }} onClick={onClose}>
          {t('common:close')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmGivingFeedbackDialog
