import React from 'react'

import { Grid, Box, CircularProgress, Typography } from '@material-ui/core'
import OngoingIcon from '@material-ui/icons/Schedule'
import UpcomingIcon from '@material-ui/icons/Event'
import EndedIcon from '@material-ui/icons/Done'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnitsV2'
import { getGroupedCourseUnits } from './utils'
import GroupAccordion from './GroupAccordion'

const TeacherView = () => {
  const { courseUnits, isLoading } = useTeacherCourseUnits()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    )
  }

  const { ongoing, upcoming, ended } = getGroupedCourseUnits(courseUnits)

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          Opetukseni
        </Typography>
      </Box>

      <Grid spacing={2} container>
        <Grid xs={12} sm={12} md={4} item>
          <GroupAccordion
            icon={<OngoingIcon />}
            title="Käynnissä olevat kurssit"
            courseUnits={ongoing}
            group="ONGOING"
          />
        </Grid>

        <Grid xs={12} sm={12} md={4} item>
          <GroupAccordion
            icon={<UpcomingIcon />}
            title="Tulevat kurssit"
            courseUnits={upcoming}
            group="UPCOMING"
          />
        </Grid>

        <Grid xs={12} sm={12} md={4} item>
          <GroupAccordion
            icon={<EndedIcon />}
            title="Päättyneet kurssit"
            courseUnits={ended}
            group="ENDED"
          />
        </Grid>
      </Grid>
    </>
  )
}

export default TeacherView
