import React from 'react'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { formatDuration, intervalToDuration } from 'date-fns'

import apiClient from '../../../../util/apiClient'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import useUpdaterStatuses from '../../../../hooks/useUpdaterStatuses'
import { GRAYLOG_URL, inProduction } from '../../../../util/common'
import ExternalLink from '../../../../components/common/ExternalLink'

const createGraylogLink = updaterStatus => {
  const baseUrl = GRAYLOG_URL
  const start = updaterStatus.startedAt
  const end = updaterStatus.finishedAt || new Date()
  return `${baseUrl}/search?q=source%3A+svm-103+AND+container_name%3A+updater&rangetype=absolute&from=${start}&to=${end}`
}

const StatusChip = ({ status }) => {
  let color = 'default'
  if (status === 'RUNNING') {
    color = 'info'
  } else if (status === 'FINISHED') {
    color = 'success'
  } else if (status === 'INTERRUPTED') {
    color = 'warning'
  } else if (status === 'FAILURE') {
    color = 'error'
  }
  return <Chip size="small" label={status} color={color} />
}

const StatusTable = ({ updaterStatuses }) => {
  const formattedStatuses = React.useMemo(
    () =>
      updaterStatuses?.map(s => {
        const formattedStartedAt = new Date(s.startedAt).toLocaleString()
        const formattedFinishedAt = s.finishedAt ? new Date(s.finishedAt).toLocaleString() : 'Not yet finished'

        const duration = intervalToDuration({
          start: Date.parse(s.startedAt),
          end: s.finishedAt ? Date.parse(s.finishedAt) : Date.now(),
        })
        const formattedDuration =
          formatDuration(duration, {
            format: ['hours', 'minutes', 'seconds'],
          }) || '0 seconds'

        const link = createGraylogLink(s)

        return {
          ...s,
          formattedStartedAt,
          formattedFinishedAt,
          formattedDuration,
          link,
        }
      }),
    [updaterStatuses]
  )

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Job type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Started at</TableCell>
            <TableCell>Finished at</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Logs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedStatuses?.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.jobType}</TableCell>
              <TableCell>
                <StatusChip status={s.status} />
              </TableCell>
              <TableCell>{s.formattedStartedAt}</TableCell>
              <TableCell>{s.formattedFinishedAt}</TableCell>
              <TableCell>{s.formattedDuration}</TableCell>
              <TableCell>
                <ExternalLink href={s.link}>Graylog</ExternalLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const UpdaterView = () => {
  const [jobType, setJobType] = React.useState('ALL')
  const { updaterStatuses, isLoading, refetch } = useUpdaterStatuses(jobType, {
    refetchInterval: 10_000,
  })

  if (isLoading) {
    return <LoadingProgress />
  }

  const runUpdater = async () => {
    if (updaterStatuses.some(s => s.status === 'RUNNING')) {
      if (!window.confirm('Updater seems to be running. Are you sure you want to start another run anyway?')) return
    }
    if (inProduction) {
      if (!window.confirm('You are in production. Please confirm that you want to run the full updater cycle.')) return
    }
    await apiClient.post('/admin/run-updater', {})
    setTimeout(refetch, 1000)
  }

  return (
    <Box marginTop={4}>
      <Box mb="2rem">
        <Button variant="contained" color="primary" onClick={runUpdater}>
          Run updater
        </Button>
      </Box>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Job type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={jobType}
          label="JOB TYPE"
          onChange={e => setJobType(e.target.value)}
        >
          <MenuItem value="ALL">ALL</MenuItem>
          <MenuItem value="NIGHTLY">NIGHTLY</MenuItem>
          <MenuItem value="ENROLMENTS">ENROLMENTS</MenuItem>
        </Select>
      </FormControl>
      <StatusTable updaterStatuses={updaterStatuses} />
    </Box>
  )
}

export default UpdaterView
