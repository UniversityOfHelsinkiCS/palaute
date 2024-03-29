import React, { useState } from 'react'
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Paper,
  TextField,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material'
import { useSnackbar } from 'notistack'

import apiClient from '../../../../util/apiClient'
import useInactiveCourseRealisations from '../../../../hooks/useInactiveCourseRealisations'

const Enable = ({ cur, active, setActive }) => {
  const { enqueueSnackbar } = useSnackbar()

  const handleSetActive = async () => {
    const confirm = () =>
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

const CourseList = React.memo(({ courses }) => courses.map(cur => <CourseAccordion key={cur.id} cur={cur} />))

const EnableCourses = () => {
  const [search, setSearch] = useState('')
  const deferredSearch = React.useDeferredValue(search)

  const { inactiveCourseRealisations, isLoading } = useInactiveCourseRealisations()

  const filteredInactiveCourseRealisations = React.useMemo(
    () =>
      isLoading
        ? []
        : inactiveCourseRealisations.filter(
            cur =>
              cur.id.startsWith(deferredSearch) ||
              cur.name.fi?.includes(deferredSearch) ||
              cur.name.en?.includes(deferredSearch)
          ),
    [deferredSearch, inactiveCourseRealisations]
  )

  return (
    <Box mt="1rem">
      <Box my="2rem" display="flex" flexDirection="row" gap="1rem" alignItems="center">
        <TextField
          sx={{ width: '50ch' }}
          label="Search by course realisation name or id"
          variant="outlined"
          onChange={({ target }) => setSearch(target.value)}
        />
        <Chip label={filteredInactiveCourseRealisations.length} />
        <Alert sx={{ width: '60ch' }} severity="info">
          Enabled courses will activate during next Updater cycle
        </Alert>
      </Box>

      {isLoading && <LinearProgress />}
      <CourseList courses={filteredInactiveCourseRealisations} />
    </Box>
  )
}

export default EnableCourses
