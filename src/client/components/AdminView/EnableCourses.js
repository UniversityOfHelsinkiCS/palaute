import React, { useState } from 'react'
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material'
import { useSnackbar } from 'notistack'

import apiClient from '../../util/apiClient'
import useInactiveCourseRealisations from '../../hooks/useInactiveCourseRealisations'
import { LoadingProgress } from '../common/LoadingProgress'

const Actions = ({ cur, active, setActive }) => {
  const { enqueueSnackbar } = useSnackbar()

  const handleSetActive = async () => {
    try {
      await apiClient.put(`/admin/inactive-course-realisations/${cur.id}`, {
        manuallyEnabled: !active,
      })

      setActive(!active)
      enqueueSnackbar('Course realisation status updated', {
        variant: 'success',
      })
    } catch {
      enqueueSnackbar('Something went wrong', { variant: 'error' })
    }
  }

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={active}
            disabled={active}
            onClick={handleSetActive}
          />
        }
        label="Enable course realisation"
      />
    </FormGroup>
  )
}

const CourseAccordion = ({ cur }) => {
  const [active, setActive] = useState(cur.manuallyEnabled)

  return (
    <Accordion TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}>
      <AccordionSummary>
        <Box display="flex" width="100%">
          <Typography
            variant="body2"
            style={{ flexShrink: 0, flexBasis: '15%' }}
          >
            {cur.id}
          </Typography>
          <Box m={2} />
          <Typography style={{ flexShrink: 0, flexBasis: '30%' }}>
            {cur.name?.fi}
          </Typography>
          <Box m={2} />
          <Typography variant="body2">
            {new Date(cur.startDate).toLocaleDateString()} -{' '}
            {new Date(cur.endDate).toLocaleDateString()}
          </Typography>
          <Box m={2} />
          <Typography variant="body2">
            {active ? 'active' : 'inactive'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails />
      <AccordionActions>
        <Actions cur={cur} active={active} setActive={setActive} />
      </AccordionActions>
    </Accordion>
  )
}

const EnableCourses = () => {
  const { inactiveCourseRealisations, isLoading } =
    useInactiveCourseRealisations()

  if (isLoading) return <LoadingProgress />

  return (
    <Box mt="1rem">
      {inactiveCourseRealisations.map((cur) => (
        <CourseAccordion key={cur.id} cur={cur} />
      ))}
    </Box>
  )
}

export default EnableCourses
