import React from 'react'
import { Box } from '@mui/material'
import GuestFooter from './GuestUser/GuestFooter'
import GuestRouter from './GuestUser/GuestRouter'
import NavBar from './NavBar'

/* eslint-disable */
const GuestUser = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ overflowX: 'hidden' }}
    >
      <NavBar guest />
      <GuestRouter />
      <GuestFooter />
    </Box>
  )
}
/* eslint-enable */

export default GuestUser
