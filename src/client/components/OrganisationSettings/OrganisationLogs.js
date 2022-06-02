import { Box, Paper, Typography } from '@material-ui/core'
import { format } from 'date-fns'
import React from 'react'
import { useParams, Redirect } from 'react-router'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useOrganisationLogs from '../../hooks/useOrganisationLogs'
import { LoadingProgress } from '../LoadingProgress'

const getLogMessage = (data) => {
  let messages = []
  if (data.studentListVisible !== undefined) {
    messages = messages.concat(
      data.studentListVisible
        ? 'Set student list as visible'
        : 'Set student list as hidden',
    )
  }

  if (data.enabledCourseCodes) {
    messages = messages.concat(
      data.enabledCourseCodes.length > 0
        ? `Enabled feedback for course ${data.enabledCourseCodes[0]}`
        : `Disabled feedback for course ${data.disabledCourseCodes[0]}`,
    )
  }

  if (data.newFeedbackCorrespondent) {
    const { firstName, lastName } = data.newFeedbackCorrespondent
    messages = messages.concat(
      `Set feedback correspondent to ${firstName} ${lastName}`,
    )
  }

  return messages.join(', ')
}

const LogItem = ({ log }) => (
  <Box m={2}>
    <Paper>
      <Box display="flex" p={2}>
        <Typography>
          {format(new Date(log.createdAt), 'yyyy/MM/dd hh.mm')}
        </Typography>
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

  if (!authorizedUser.isAdmin) {
    return <Redirect to={`/organisations/${code}/settings/general`} />
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
