import { SettingsOutlined } from '@mui/icons-material'
import { Dialog, DialogTitle } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../../components/common/NorButton'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import FeedbackPeriodForm from './FeedbackPeriodForm'

const EditFeedbackTargetDates = () => {
  const { t } = useTranslation()
  const { isAdmin, isOrganisationAdmin, isResponsibleTeacher } = useFeedbackTargetContext()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const titleId = React.useId()
  const editButtonRef = React.useRef(null)
  const initialFocusRef = React.useRef(null)

  const closeDialog = () => setDialogOpen(false)

  const showEditButton = isAdmin || isOrganisationAdmin || isResponsibleTeacher

  if (!showEditButton) return null

  return (
    <>
      <NorButton
        ref={editButtonRef}
        sx={{ textAlign: 'center', justifyContent: 'center', maxWidth: 'fit-content' }}
        data-cy="feedback-target-edit-period"
        aria-label={t('feedbackTargetSettings:editPeriodTitle')}
        aria-haspopup="dialog"
        onClick={() => setDialogOpen(true)}
        color="primary"
        icon={<SettingsOutlined />}
      >
        {t('common:edit')}
      </NorButton>

      {/* Focus is moved on entered rather than with autoFocus: focusing while the dialog is still
          being inserted produces a focus event that screen readers process against an
          accessibility tree without the dialog in it, so the dialog's name is never announced.
          On exited it is restored explicitly, because the confirmation dialog inside the form
          restores focus to a button that unmounts together with this dialog, which would
          otherwise leave focus on the body. */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        aria-labelledby={titleId}
        disableRestoreFocus
        slotProps={{
          transition: {
            onEntered: () => initialFocusRef.current?.focus(),
            onExited: () => requestAnimationFrame(() => editButtonRef.current?.focus()),
          },
        }}
      >
        <DialogTitle id={titleId}>{t('feedbackTargetSettings:editPeriodTitle')}</DialogTitle>
        <FeedbackPeriodForm onClose={closeDialog} initialFocusRef={initialFocusRef} />
      </Dialog>
    </>
  )
}

export default EditFeedbackTargetDates
