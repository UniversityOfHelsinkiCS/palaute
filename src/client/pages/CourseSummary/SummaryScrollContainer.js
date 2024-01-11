import React from 'react'
import { Box } from '@mui/material'

const SummaryScrollContainer = ({ children }) => (
  <Box
    sx={{
      overflowY: 'auto',
      overflowX: 'scroll',

      pt: '2rem',
    }}
  >
    {children}
  </Box>
)

export default SummaryScrollContainer
