import React, { useState, useRef, useEffect } from 'react'
import { Box, Button, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import BarChartIcon from '@mui/icons-material/BarChart'

/**
 * Wrapper component that adds accessibility features to bar charts.
 * Provides:
 * - Keyboard toggle between chart and table view (Alt + T)
 * - Accessible data table as alternative to the visual chart
 * - Proper ARIA labels and roles
 *
 * @param {Object} props
 * @param {React.ReactNode} props.chart - The chart component to wrap
 * @param {React.ReactNode} props.table - The accessible table component
 * @param {string} props.chartLabel - Accessibility label for the chart
 */
const ChartAccessibilityWrapper = ({ chart, table, chartLabel = 'Chart' }) => {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useState(false)
  const wrapperRef = useRef(null)
  const toggleButtonRef = useRef(null)
  const contentId = React.useId()

  useEffect(() => {
    const handleKeyDown = event => {
      // Alt + T to toggle between chart and table
      if (event.altKey && event.key === 't') {
        event.preventDefault()
        setShowTable(prev => !prev)
        // Focus the toggle button acual state change
        setTimeout(() => toggleButtonRef.current?.focus(), 0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Box ref={wrapperRef} role="region" aria-label={chartLabel} aria-live="polite" aria-atomic="false">
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Tooltip title="Alt + T to toggle between chart and data table" enterDelay={500}>
          <Button
            ref={toggleButtonRef}
            onClick={() => setShowTable(prev => !prev)}
            size="small"
            variant="outlined"
            startIcon={showTable ? <BarChartIcon /> : <ViewWeekIcon />}
            aria-pressed={showTable}
            aria-label={showTable ? t('feedbackTargetResults:showChart') : t('feedbackTargetResults:showTable')}
          >
            {showTable ? t('feedbackTargetResults:chart') : t('feedbackTargetResults:table')}
          </Button>
        </Tooltip>
        <Box
          component="span"
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
          aria-hidden="false"
        >
          {t('feedbackTargetResults:keyboardHint')}
        </Box>
      </Box>

      <Box
        id={contentId}
        role="region"
        aria-label={
          showTable
            ? `${chartLabel} - ${t('feedbackTargetResults:table')} view`
            : `${chartLabel} - ${t('feedbackTargetResults:chart')} view`
        }
      >
        {/* Chart view */}
        {!showTable && (
          <Box role="img" aria-label="Chart visualization of results">
            {chart}
          </Box>
        )}

        {/* Table view */}
        {showTable && <Box>{table}</Box>}
      </Box>
    </Box>
  )
}

export default ChartAccessibilityWrapper
