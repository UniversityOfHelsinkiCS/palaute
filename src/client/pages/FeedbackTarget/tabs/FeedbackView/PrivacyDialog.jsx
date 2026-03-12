import React from 'react'

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { NorButton } from '../../../../components/common/NorButton'
import LinkButton from '../../../../components/common/LinkButton'

const PrivacyDialog = ({ open, onClose }) => {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="feedback-privacy-dialog-title"
      aria-describedby="feedback-privacy-dialog-description"
    >
      <DialogTitle id="feedback-privacy-dialog-title">{t('feedbackView:feedbackInfoTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="feedback-privacy-dialog-description">
          {t('feedbackView:feedbackInfoContent')}
          <br />
          <LinkButton
            title={t('feedbackView:dataProtectionNotice')}
            to={t('links:dataProtection')}
            external
            sx={{ mt: '0.5rem' }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <NorButton onClick={onClose} color="primary">
          {t('common:close')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default PrivacyDialog
