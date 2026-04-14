import React from 'react'
import { Box } from '@mui/material'

const ChartAccessibilityWrapper = ({ chart, table, showTable }) => (
  // useEffect(() => {
  //   const handleKeyDown = event => {
  //     // Alt + T to toggle between chart and table
  //     if (event.altKey && event.key === 't') {
  //       event.preventDefault()
  //       setShowTable(prev => !prev)
  //     }
  //   }

  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => window.removeEventListener('keydown', handleKeyDown)
  // }, [])

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
