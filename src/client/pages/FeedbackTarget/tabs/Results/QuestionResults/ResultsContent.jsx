import React from 'react'
import { Box } from '@mui/material'
import ChartAccessibilityWrapper from './ChartAccessibilityWrapper'

const ResultsContent = ({ chart, table, chartLabel, children }) => {
  if (table && chartLabel) {
    return (
      <Box display="flex" flexDirection="column">
        <ChartAccessibilityWrapper chart={chart} table={table} chartLabel={chartLabel} />
        {children}
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column">
      {chart}
      {children}
    </Box>
  )
}

export default ResultsContent
