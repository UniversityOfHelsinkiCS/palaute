import React from 'react'
import { Box } from '@mui/material'

const ResultsContent = ({ chart, children }) => (
  <Box display="flex" flexDirection="column" alignItems="stretch">
    {chart}
    {children}
  </Box>
)

export default ResultsContent
