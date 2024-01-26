import React from 'react'

import { Grid, Box, Typography } from '@mui/material'
import OngoingIcon from '@mui/icons-material/Schedule'
import UpcomingIcon from '@mui/icons-material/Event'
import EndedIcon from '@mui/icons-material/Done'
import { useTranslation } from 'react-i18next'

import useTeacherCourseUnits from '../../../hooks/useTeacherCourseUnits'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import Title from '../../../components/common/Title'

const MyTeaching = () => {
  const { courseUnits, isLoading } = useTeacherCourseUnits()
  const { t } = useTranslation()

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <>
      <Title>{t('common:teacherPage')}</Title>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('teacherView:mainHeading')}
        </Typography>
      </Box>
    </>
  )
}

export default MyTeaching
