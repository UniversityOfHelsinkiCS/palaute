import React from 'react'
import { Box } from '@mui/material'

const ResultsContent = ({ chart, children }) => (
  <Box>
    {chart}
    {children}
  </Box>
)

export default ResultsContent
