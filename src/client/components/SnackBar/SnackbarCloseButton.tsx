import React from 'react'
import { SnackbarKey, useSnackbar } from 'notistack'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type SnackbarCloseButtonProps = {
  snackbarKey: SnackbarKey
}

const SnackbarCloseButton = ({ snackbarKey }: SnackbarCloseButtonProps) => {
  const { closeSnackbar } = useSnackbar()
  return (
    <IconButton aria-label="close" color="inherit" onClick={() => closeSnackbar(snackbarKey)}>
      <CloseIcon />
    </IconButton>
  )
}

export default SnackbarCloseButton
