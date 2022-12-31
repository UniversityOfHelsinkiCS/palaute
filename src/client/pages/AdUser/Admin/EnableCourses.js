import React, { useState } from 'react'
import { Box, Typography, FormGroup, FormControlLabel, Switch, Paper, TextField, Alert } from '@mui/material'
import { useSnackbar } from 'notistack'

import apiClient from '../../../util/apiClient'
import useInactiveCourseRealisations from '../../../hooks/useInactiveCourseRealisations'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

const Enable = ({ cur, active, setActive }) => {
  const { enqueueSnackbar } = useSnackbar()

  const handleSetActive = async () => {
    const confirm = () =>
      // eslint-disable-next-line no-alert
      window.confirm('Are you sure? Course realisation and associated feedback targets will be deleted immediately.')

    if (active && !confirm()) return

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
    <Box sx={{ margin: 'auto 0 auto auto' }}>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={active} onClick={handleSetActive} />}
          label={active ? 'Enabled' : 'Disabled'}
          labelPlacement="start"
        />
      </FormGroup>
    </Box>
  )
}

const CourseAccordion = ({ cur }) => {
  const [active, setActive] = useState(cur.manuallyEnabled)

  return (
    <Paper sx={{ marginBottom: '0.5rem' }}>
      <Box padding="1rem" display="flex" width="100%">
        <Typography variant="body2" style={{ flexShrink: 0, flexBasis: '15%' }}>
          {cur.id}
        </Typography>
        <Box m={2} />
        <Typography style={{ flexShrink: 0, flexBasis: '30%' }}>{cur.name?.fi}</Typography>
        <Box m={2} />
        <Typography variant="body2">
          {new Date(cur.startDate).toLocaleDateString()} - {new Date(cur.endDate).toLocaleDateString()}
        </Typography>
        <Box m={2} />
        <Enable cur={cur} active={active} setActive={setActive} />
      </Box>
    </Paper>
  )
}

const EnableCourses = () => {
  const [search, setSearch] = useState('')

  const { inactiveCourseRealisations, isLoading } = useInactiveCourseRealisations()

  if (isLoading) return <LoadingProgress />

  const filteredInactiveCourseRealisations = inactiveCourseRealisations.filter(
    cur => cur.id.startsWith(search) || cur.name.fi.includes(search) || cur.name.en.includes(search)
  )

  return (
    <Box mt="1rem">
      <Box m="1rem" display="flex" flexDirection="row">
        <TextField
          sx={{ width: '50ch', marginRight: '1rem' }}
          label="Search by course realisation name or id"
          variant="outlined"
          onChange={({ target }) => setSearch(target.value)}
        />
        <Alert sx={{ width: '60ch' }} severity="info">
          Enabled courses will activate during next Updater cycle
        </Alert>
      </Box>

      {filteredInactiveCourseRealisations.map(cur => (
        <CourseAccordion key={cur.id} cur={cur} />
      ))}
    </Box>
  )
}

export default EnableCourses
