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

  if (data.enabledStudentList) {
    messages = messages.concat(
      data.enabledStudentList.length > 0
        ? `Set student list visible for course ${data.enabledStudentList[0]}`
        : `Set student list as not visible for course ${data.disabledStudentList[0]}`
    )
  }

  if (data.newFeedbackCorrespondent !== undefined) {
    messages = messages.concat(
      data.newFeedbackCorrespondent
        ? `Set feedback correspondent to ${data.newFeedbackCorrespondent.firstName} ${data.newFeedbackCorrespondent.lastName}`
        : `Removed feedback correspondent`,
    )
  }

  if (data.createQuestion) {
    const { label } = data.createQuestion
    messages = messages.concat(
      `Added question '${label.en || label.fi || label.sv}'`,
    )
  }

  if (data.deleteQuestion) {
    const { label } = data.deleteQuestion
    messages = messages.concat(
      `Deleted question '${label.en || label.fi || label.sv}'`,
    )
  }

  if (data.updateQuestion) {
    const { previousLabel, required } = data.updateQuestion
    const genericMessage = `Updated question '${previousLabel}'`

    messages = messages.concat(genericMessage)
    if (required !== undefined) {
      messages = required
        ? messages.concat(`Set question as required`)
        : messages.concat(`Set question as voluntary`)
    }
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
