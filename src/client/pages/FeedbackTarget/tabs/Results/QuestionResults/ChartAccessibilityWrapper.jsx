import React from 'react'
import { Box } from '@mui/material'

const ChartAccessibilityWrapper = ({ chart, table, showTable }) => (
  <>
    {!showTable && (
      <Box role="img" aria-label="Chart visualization of results">
        {chart}
      </Box>
    )}

    {showTable && <Box>{table}</Box>}
  </>
)

export default ChartAccessibilityWrapper
