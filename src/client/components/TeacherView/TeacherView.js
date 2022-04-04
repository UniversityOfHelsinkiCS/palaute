import React from 'react'

import { Grid, Box, Typography } from '@material-ui/core'
import OngoingIcon from '@material-ui/icons/Schedule'
import UpcomingIcon from '@material-ui/icons/Event'
import EndedIcon from '@material-ui/icons/Done'
import { useTranslation } from 'react-i18next'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'
import { getGroupedCourseUnits } from './utils'
import GroupAccordion from './GroupAccordion'
import { LoadingProgress } from '../LoadingProgress'
import Title from '../Title'

const TeacherView = () => {
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

export default TeacherView
