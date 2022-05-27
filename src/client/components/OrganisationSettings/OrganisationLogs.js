import { Box, Paper, Typography } from '@material-ui/core'
import React from 'react'
import { useParams } from 'react-router'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useOrganisationLogs from '../../hooks/useOrganisationLogs'
import { LoadingProgress } from '../LoadingProgress'

const getLogMessage = (data) => JSON.stringify(data)

const LogItem = ({ log }) => (
  <Box m={2}>
    <Paper>
      <Box display="flex" p={2}>
        <Typography>{new Date(log.createdAt).toLocaleDateString()}</Typography>
        <Box m={2} />
        <Typography>{log.user.email}</Typography>
        <Box m={2} />
        <Typography>{getLogMessage(log.data)}</Typography>
      </Box>
    </Paper>
  </Box>
)

const OrganisationLogs = () => {
  const { code } = useParams()
  const { organisationLogs, isLoading } = useOrganisationLogs(code)
  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  if (isLoading || isUserLoading) {
    return <LoadingProgress />
  }

  return (
    <Box display="flex" flexDirection="column">
      {organisationLogs.map((log, idx) => (
        <LogItem key={idx} log={log} />
      ))}
    </Box>
  )
}

export default OrganisationLogs
