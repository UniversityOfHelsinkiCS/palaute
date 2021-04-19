import React, { useState, useEffect } from 'react'

import { Snackbar, Button } from '@material-ui/core'

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
        <Button color="secondary" onClick={handleClick}>
          Return to yourself
        </Button>
      }
    />
  )
}

export default AdminLoggedInAsBanner
