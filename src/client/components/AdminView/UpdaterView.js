/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react'
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
} from '@material-ui/core'
import { formatDuration, intervalToDuration } from 'date-fns'

import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../LoadingProgress'
import Alert from '../Alert'
import useUpdaterStatus from '../../hooks/useUpdaterStatus'
import { inProduction } from '../../../config'

const StatusTable = ({ updaterStatus }) => {
  const { startedAt, finishedAt, status } = updaterStatus

  const [endOfDuration, setEndOfDuration] = useState(Date.now())

  useEffect(() => {
    if (status === 'RUNNING') {
      setEndOfDuration(Date.now())
      const id = setInterval(() => setEndOfDuration(Date.now()), 1000)
      return () => {
        window.clearInterval(id)
      }
    }
    if (finishedAt) setEndOfDuration(Date.parse(finishedAt))
    return null
  }, [status])

  if (!startedAt) {
    return (
      <Alert severity="warning">
        No data. Looks like updater hasn&#39;t been run yet.
      </Alert>
    )
  }

  const formattedStartedAt = new Date(startedAt).toLocaleString()
  const formattedFinishedAt = finishedAt
    ? new Date(finishedAt).toLocaleString()
    : 'Not yet finished'

  const duration = intervalToDuration({
    start: Date.parse(startedAt),
    end: endOfDuration,
  })
  const formattedDuration =
    formatDuration(duration, {
      format: ['hours', 'minutes', 'seconds'],
    }) || '0 seconds'

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Updater status</TableCell>
            <TableCell>Started at</TableCell>
            <TableCell>Finished at</TableCell>
            <TableCell>Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key="asd">
            <TableCell component="th" scope="row">
              {status}
            </TableCell>
            <TableCell>{formattedStartedAt}</TableCell>
            <TableCell>{formattedFinishedAt}</TableCell>
            <TableCell>{formattedDuration}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const UpdaterView = () => {
  const { updaterStatus, isLoading, refetch } = useUpdaterStatus({
    refetchInterval: 10_000,
  })

  if (isLoading) {
    return <LoadingProgress />
  }

  const runUpdater = async () => {
    if (updaterStatus?.status === 'RUNNING') {
      if (
        !window.confirm(
          'Updater seems to be running. Are you sure you want to start another run anyway?',
        )
      )
        return
    }
    if (inProduction) {
      if (
        !window.confirm(
          'You are in production. Please confirm that you want to run the full updater cycle.',
        )
      )
        return
    }
    await apiClient.post('/admin/run-updater', {})
    setTimeout(refetch, 1000)
  }

  return (
    <Box marginTop={4}>
      <StatusTable updaterStatus={updaterStatus} />
      <Box marginTop={2}>
        <Button variant="contained" color="primary" onClick={runUpdater}>
          Run updater
        </Button>
      </Box>
    </Box>
  )
}

export default UpdaterView
