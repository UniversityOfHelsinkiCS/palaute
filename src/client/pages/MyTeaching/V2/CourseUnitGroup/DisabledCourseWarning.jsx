import React from 'react'
import { useTranslation } from 'react-i18next'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Typography } from '@mui/material'

const DisabledCourseWarning = () => {
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <WarningAmberIcon sx={{ color: '#6b3600' }} aria-hidden />
      <Typography>{t('teacherView:disabledCourseWarning')}</Typography>
    </Box>
  )
}

export default DisabledCourseWarning
