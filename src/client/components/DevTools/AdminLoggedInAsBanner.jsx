import React from 'react'

import { Snackbar } from '@mui/material'
import { NorButton } from '../common/NorButton'

const AdminLoggedInAsBanner = ({ isLoggedInAs, exitLoggedInAs }) => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    open={isLoggedInAs}
    message="You are logged in as someone else!"
    action={
      <NorButton color="empty" sx={{ color: 'yellow' }} onClick={exitLoggedInAs}>
        Return to yourself
      </NorButton>
    }
  />
)

export default AdminLoggedInAsBanner
