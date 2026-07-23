import { Box } from '@mui/material'
import React from 'react'

const SummaryScrollContainer = ({ children }) => (
  <Box
    sx={{
      overflowY: 'auto',
      overflowX: 'auto',
    }}
  >
    {children}
  </Box>
)

export default SummaryScrollContainer
