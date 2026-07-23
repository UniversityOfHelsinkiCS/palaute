import { Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

const ResultsContent = ({ chart, table, showTable, children }) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {!showTable && (
        <Box role="img" aria-label={t('feedbackTargetResults:chartAriaLabel')}>
          {chart}
        </Box>
      )}
      {showTable && <Box>{table}</Box>}
      {children}
    </Box>
  )
}

export default ResultsContent
