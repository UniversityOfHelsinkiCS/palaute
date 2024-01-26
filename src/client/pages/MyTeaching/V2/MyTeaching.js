import React from 'react'
import { useLocation } from 'react-router-dom'
import qs from 'qs'

import { Grid, Box, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import useTeacherCourseUnits from '../../../hooks/useTeacherCourseUnits'

import StatusTabs from './StatusTabs'
import Title from '../../../components/common/Title'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

import { getGroupedCourseUnits } from '../utils'

const MyTeaching = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const { status = 'waiting' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { courseUnits, isLoading } = useTeacherCourseUnits()
  const { ongoing, upcoming, ended } = getGroupedCourseUnits(courseUnits)

  return (
    <>
      <Title>{t('common:teacherPage')}</Title>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('teacherView:mainHeading')}
        </Typography>
      </Box>

      <StatusTabs
        sx={{ marginBottom: 3 }}
        status={status}
        counts={{
          ongoing: ongoing?.length,
          waiting: upcoming?.length,
          given: ended?.length,
        }}
      />

      {isLoading && <LoadingProgress />}
    </>
  )
}

export default MyTeaching
