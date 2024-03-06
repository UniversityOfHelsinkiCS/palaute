import React from 'react'
import { Box, Tooltip, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'

const CensoredCount = ({ count }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <Box sx={{ '@media print': { display: 'none' } }}>
      <Tooltip title={t('courseSummary:censoredCount')} placement="right">
        <Box color={theme.palette.error.light}>{count}</Box>
      </Tooltip>
    </Box>
  )
}

export default CensoredCount
