import React, { useState, useEffect } from 'react'

import { Snackbar } from '@mui/material'
import { NorButton } from '../common/NorButton'

const AdminLoggedInAsBanner = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loggedInAs = localStorage.getItem('adminLoggedInAs')
    if (!loggedInAs) return

    setOpen(true)
  }, [])

  const handleClick = () => {
    localStorage.removeItem('adminLoggedInAs')
    window.location.reload()
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={open}
      message="You are logged in as someone else!"
      action={
        <NorButton color="empty" sx={{ color: 'yellow' }} onClick={handleClick}>
          Return to yourself
        </NorButton>
      }
    />
  )
}

export default AdminLoggedInAsBanner
