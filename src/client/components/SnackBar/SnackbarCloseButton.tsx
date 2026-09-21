import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'
import { SnackbarKey, useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { announceSnackbar } from './snackbarAnnouncer'

type SnackbarCloseButtonProps = {
  snackbarKey: SnackbarKey
}

const SnackbarCloseButton = ({ snackbarKey }: SnackbarCloseButtonProps) => {
  const { closeSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // This button is rendered inside every snackbar, so it is where we get hold of the
  // message text and pass it to the live region, which announces it. Notistack also gives
  // the snackbar role="alert", but that alert is announced only sometimes: never when an
  // open MUI dialog has marked the snackbar aria-hidden, and unreliably otherwise. Its
  // role is removed so that the two do not announce the same message twice. Done in a
  // layout effect, before the browser paints, to leave as little room as possible for a
  // screen reader to read the alert before it is gone.
  // This is a rather complicated solution written by Claude but the only one that worked on both Firefox and Chrome
  // and both when the snackbar comes from a dialog and when it comes from the main page.
  // Feel free to try to simplify it, but be sure to test with more than one browser and an open dialog.
  React.useLayoutEffect(() => {
    let ancestor = buttonRef.current?.parentElement
    let content: HTMLElement | null = null
    while (ancestor && !content) {
      if (ancestor.querySelector('#notistack-snackbar')) content = ancestor
      ancestor = ancestor.parentElement
    }

    if (content?.getAttribute('role') === 'alert') {
      content.removeAttribute('role')
    }

    const message = content?.querySelector('#notistack-snackbar')
    if (message?.textContent) {
      announceSnackbar(message.textContent)
    }
  }, [snackbarKey])

  return (
    <IconButton
      ref={buttonRef}
      aria-label={t('common:close')}
      color="inherit"
      onClick={() => closeSnackbar(snackbarKey)}
    >
      <CloseIcon />
    </IconButton>
  )
}

export default SnackbarCloseButton
