import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'
import { SnackbarKey, useSnackbar } from 'notistack'

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
