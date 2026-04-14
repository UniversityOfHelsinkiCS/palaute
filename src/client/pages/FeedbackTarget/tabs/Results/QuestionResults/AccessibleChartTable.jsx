import React, { useRef } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'

const AccessibleChartTable = ({ labels, data, totalFeedbacks, caption }) => {
  const { t } = useTranslation()
  const rowRefs = useRef([])

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
    <TableContainer sx={{ my: 2 }}>
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
                <TableCell align="right">{percentage} %</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AccessibleChartTable
