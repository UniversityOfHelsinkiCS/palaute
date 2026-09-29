import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { ReactNode, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from './NorButton'

type ConfirmDialogProps = {
  open?: boolean
  title: ReactNode
  content: ReactNode
  confirmLabel: ReactNode
  cancelLabel?: ReactNode
  confirmColor?: 'primary' | 'error'
  onConfirm: () => void
  onClose: () => void
  // Lets the caller move focus somewhere else than the opening button, e.g. when it gets removed
  disableRestoreFocus?: boolean
  onExited?: () => void
  dataCy?: string
}

const ConfirmDialog = ({
  open = false,
  title,
  content,
  confirmLabel,
  cancelLabel,
  confirmColor = 'primary',
  onConfirm,
  onClose,
  disableRestoreFocus = false,
  onExited,
  dataCy,
}: ConfirmDialogProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  // MUI reads disableRestoreFocus when the dialog opens, but callers often only know whether to
  // restore focus when it closes. Restore it here instead, using the prop's value at that point.
  const handleExited = () => {
    const opener = openerRef.current
    openerRef.current = null
    if (!disableRestoreFocus && opener?.isConnected) opener.focus()
    onExited?.()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      disableRestoreFocus
      slotProps={{
        transition: {
          // Runs before MUI moves focus into the dialog, so this is still the opening control
          onEnter: () => {
            openerRef.current = document.activeElement as HTMLElement | null
          },
          // Focus a real control inside the dialog rather than leaving MUI's default focus on the
          // presentational transition wrapper, which never gets the dialog's name announced.
          // Wait until the transition has finished, as Chrome doesn't announce focus moving into
          // a freshly mounted dialog on its first open.
          onEntered: () => cancelRef.current?.focus(),
          onExited: handleExited,
        },
      }}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent id={descriptionId}>{content}</DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <NorButton data-cy={dataCy && `${dataCy}-cancel`} color="cancel" onClick={onClose} ref={cancelRef}>
          {cancelLabel ?? t('common:cancel')}
        </NorButton>
        <NorButton data-cy={dataCy && `${dataCy}-confirm`} color={confirmColor} onClick={onConfirm}>
          {confirmLabel}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
