import { useEffect } from 'react'
import { useSnackbar } from 'notistack'

const EscSnackbarCloser = () => {
  const { closeSnackbar } = useSnackbar()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSnackbar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeSnackbar])

  return null
}

export default EscSnackbarCloser
