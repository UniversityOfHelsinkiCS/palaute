import React from 'react'

import { Grid, Box, Typography } from '@mui/material'
import OngoingIcon from '@mui/icons-material/Schedule'
import UpcomingIcon from '@mui/icons-material/Event'
import EndedIcon from '@mui/icons-material/Done'
import { useTranslation } from 'react-i18next'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'
import { getGroupedCourseUnits } from './utils'
import GroupAccordion from './GroupAccordion'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import Title from '../../components/common/Title'

const MyTeaching = () => {
  const { courseUnits, isLoading } = useTeacherCourseUnits()
  const { t } = useTranslation()

  if (isLoading) {
    return <LoadingProgress />
  }

  const { ongoing, upcoming, ended } = getGroupedCourseUnits(courseUnits)

  return (
    <>
      <Title>{t('teacherPage')}</Title>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('teacherView:mainHeading')}
        </Typography>
      </Box>

      <Grid spacing={2} container>
        <Grid xs={12} sm={12} md={4} item>
          <GroupAccordion
            icon={<OngoingIcon />}
            title={t('teacherView:ongoingCourses')}
            courseUnits={ongoing}
            group="ONGOING"
          />
        </Grid>

        <Grid xs={12} sm={12} md={4} item>
          <GroupAccordion
            icon={<UpcomingIcon />}
            title={t('teacherView:upcomingCourses')}
            courseUnits={upcoming}
            group="UPCOMING"
          />
        </Grid>

        <Grid xs={12} sm={12} md={4} item>
          <GroupAccordion
            icon={<EndedIcon />}
            title={t('teacherView:endedCourses')}
            courseUnits={ended}
            group="ENDED"
          />
        </Grid>
      </Grid>
    </>
  )
}

export default MyTeaching
