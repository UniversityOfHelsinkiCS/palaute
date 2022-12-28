import React from 'react'
import { Box } from '@mui/material'
import GuestFooter from './GuestFooter'
import GuestRouter from './GuestRouter'
import NavBar from '../../components/NavBar'

const GuestUser = () => (
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

export default GuestUser
