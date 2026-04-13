import React from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

/**
 * Accessible data table component for displaying chart data in a structured format.
 * Provides keyboard navigation and screen reader support.
 *
 * @param {Object} props
 * @param {Array<string>} props.labels - Row labels (e.g., rating options, question options)
 * @param {Array<number>} props.data - Data values corresponding to each label
 * @param {number} props.totalFeedbacks - Total number of feedbacks for percentage calculation
 * @param {string} props.title - Table title/caption for accessibility
 * @param {string} props.ariaDescription - Optional extended description for accessibility
 */
const AccessibleChartTable = ({ labels, data, totalFeedbacks, caption, ariaDescription }) => {
  const { t } = useTranslation()

  const tableId = React.useId()
  const descriptionId = React.useId()
  const rowRefs = React.useRef([])

  const handleRowKeyDown = (event, index) => {
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault()
      rowRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowDown' && index < labels.length - 1) {
      event.preventDefault()
      rowRefs.current[index + 1]?.focus()
    }
  }

  return (
    <Box
      role="region"
      aria-labelledby={`${tableId}-title`}
      aria-describedby={ariaDescription ? descriptionId : undefined}
      sx={{ my: 2 }}
    >
      {ariaDescription && (
        <Typography
          id={descriptionId}
          variant="body2"
          sx={{
            mb: 1,
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {ariaDescription}
        </Typography>
      )}
      <TableContainer>
        <Table
          size="small"
          sx={{
            '& thead': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <caption
            style={{ captionSide: 'top', textAlign: 'left', fontSize: '1rem', fontWeight: 'bold', padding: '0.5rem 0' }}
          >
            {caption || t('feedbackView:dataTableCaption')}
          </caption>
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col" sx={{ fontWeight: 'bold' }}>
                {t('feedbackView:option')}
              </TableCell>
              <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
                {t('feedbackView:count')}
              </TableCell>
              <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
                {t('feedbackView:percentage')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((label, index) => {
              const count = data[index] ?? 0
              const percentage = totalFeedbacks > 0 ? ((count / totalFeedbacks) * 100).toFixed(1) : 0
              const displayLabel = Array.isArray(label) ? label.join(' ') : label
              return (
                <TableRow
                  key={index}
                  ref={el => {
                    rowRefs.current[index] = el
                  }}
                  hover
                  tabIndex={0}
                  onKeyDown={event => handleRowKeyDown(event, index)}
                  sx={{
                    '&:focus-visible': {
                      outline: '3px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '-3px',
                    },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {displayLabel}
                  </TableCell>
                  <TableCell align="right">{count}</TableCell>
                  <TableCell align="right">{percentage}%</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          mt: 1,
          fontSize: '0.875rem',
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        <Typography variant="body2">
          Use arrow keys to navigate the table. Press Tab to move to the next section.
        </Typography>
      </Box>
    </Box>
  )
}

export default AccessibleChartTable
