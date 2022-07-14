import React from 'react'
import { Box } from '@mui/material'
import GuestFooter from './GuestUser/GuestFooter'
import GuestNavBar from './GuestUser/GuestNavBar'
import GuestRouter from './GuestUser/GuestRouter'

/* eslint-disable */
const GuestUser = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ overflowX: 'hidden' }}
    >
      <GuestNavBar />
      <GuestRouter />
      <GuestFooter />
    </Box>
  )
}
/* eslint-enable */

export default GuestUser
