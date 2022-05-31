import { Box, Paper, Typography } from '@material-ui/core'
import { format } from 'date-fns'
import React from 'react'
import { useParams, Redirect } from 'react-router'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useFeedbackTargetLogs from '../../hooks/useFeedbackTargetLogs'
import { LoadingProgress } from '../LoadingProgress'

const getLogMessage = (data) => {
  let messages = []
  if (data.opensAt) {
    messages = messages.concat(
      `Set feedback period to open at ${format(
        new Date(data.opensAt),
        'yyyy/MM/dd',
      )}`,
    )
  }

  if (data.closesAt) {
    messages = messages.concat(
      `Set feedback period to close at ${format(
        new Date(data.closesAt),
        'yyyy/MM/dd',
      )}`,
    )
  }

  if (data.feedbackVisibility) {
    messages = messages.concat(
      data.feedbackVisibility === 'ALL'
        ? 'Set public questions visible to all students'
        : 'Set public questions visible to enrolled students',
    )
  }

  if (data.enabledPublicQuestions) {
    messages = messages.concat(
      data.enabledPublicQuestions.length > 0
        ? `Set answers visible for question '${data.enabledPublicQuestions[0].data.label.en}'`
        : `Set answers hidden for question '${data.disabledPublicQuestions[0].data.label.en}'`,
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

const FeedbackTargetLogs = () => {
  const { id } = useParams()
  const { feedbackTargetLogs, isLoading } = useFeedbackTargetLogs(id)
  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  if (isLoading || isUserLoading) {
    return <LoadingProgress />
  }

  if (!authorizedUser.isAdmin) {
    return <Redirect to={`/targets/${id}/feedback`} />
  }

  return (
    <Box display="flex" flexDirection="column">
      {feedbackTargetLogs.map((log, idx) => (
        <LogItem key={idx} log={log} />
      ))}
    </Box>
  )
}

export default FeedbackTargetLogs
