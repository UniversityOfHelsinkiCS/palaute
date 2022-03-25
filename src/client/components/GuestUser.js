import React from 'react'
import { Box } from '@material-ui/core'
import GuestFooter from './GuestUser/GuestFooter'
import GuestNavBar from './GuestUser/GuestNavBar'
import GuestRouter from './GuestUser/GuestRouter'

/* eslint-disable */
const GuestUser = () => {
  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <GuestNavBar />
      <GuestRouter />
      <GuestFooter />
    </Box>
  )
}
/* eslint-enable */

export default GuestUser
