import { Box, DialogContent, Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import React, { useEffect, useState } from 'react'
import LoginAsSelector from '../../pages/Admin/tabs/Users/LoginAsSelector'

export const SuperSpeedLoginAs = () => {
  const [open, setOpen] = useState(false)

  // Register hotkey event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'l' && event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="super-speed-login-dialog-title"
      aria-describedby="super-speed-login-dialog-description"
    >
      <DialogTitle id="super-speed-login-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🚀 Super Speed Login As 🚀
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            Press <strong>ESC</strong> to close
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <LoginAsSelector />
      </DialogContent>
    </Dialog>
  )
}
