import React from 'react'
import { Box } from '@mui/material'
import ChartAccessibilityWrapper from './ChartAccessibilityWrapper'

const ResultsContent = ({ chart, table, showTable, setShowTable, children }) => {
  if (table) {
    return (
      <Box display="flex" flexDirection="column">
        <ChartAccessibilityWrapper chart={chart} table={table} showTable={showTable} setShowTable={setShowTable} />
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
