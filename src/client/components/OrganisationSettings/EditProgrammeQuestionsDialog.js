import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

const EditProgrammeQuestionsDialog = ({ open = false, onClose, onConfirm }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {t('organisationSettings:editProgrammeQuestionsDialogTitle')}
      </DialogTitle>
      <DialogContent>
        {t('organisationSettings:editProgrammeQuestionsDialogContent')}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          {t('organisationSettings:editProgrammeQuestionsDialogCancel')}
        </Button>
        <Button color="primary" onClick={onConfirm} data-cy="submit">
          {t('organisationSettings:editProgrammeQuestionsDialogConfirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditProgrammeQuestionsDialog
