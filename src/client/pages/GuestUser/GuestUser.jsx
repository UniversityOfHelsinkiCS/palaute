import { Box } from '@mui/material'
import React from 'react'

import NavBar from '../../components/NavBar'
import GuestFooter from './GuestFooter'
import GuestRouter from './GuestRouter'

const GuestUser = () => (
  <Box display="flex" flexDirection="column" height="100vh" sx={{ overflowX: 'hidden' }}>
    <NavBar guest />
    <Box component="main" role="main" id="main-content">
      <GuestRouter />
    </Box>
    <GuestFooter />
  </Box>
)

export default GuestUser
