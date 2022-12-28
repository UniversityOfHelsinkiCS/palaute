import { Box, Paper, Typography } from '@mui/material'
import { format } from 'date-fns'
import React from 'react'
import { useParams } from 'react-router'
import useOrganisationLogs from '../../../hooks/useOrganisationLogs'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

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

  if (data.addedPublicQuestionIds) {
    messages = messages.concat(
      data.addedPublicQuestionIds.length > 0
        ? `Set question ${data.addedPublicQuestionIds[0]} public`
        : `Unset question ${data.removedPublicQuestionIds[0]} public`,
    )
  }

  if (data.enabledStudentList) {
    messages = messages.concat(
      data.enabledStudentList.length > 0
        ? `Set student list visible for course ${data.enabledStudentList[0]}`
        : `Set student list as not visible for course ${data.disabledStudentList[0]}`,
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
    const { label, content } = data.createQuestion
    const question =
      (label && (label.en || label.fi || label.sv)) ||
      (content && (content.en || content.fi || content.sv))
    messages = messages.concat(`Added question '${question}'`)
  }

  if (data.deleteQuestion) {
    const { label, content } = data.deleteQuestion
    const question =
      (label && (label.en || label.fi || label.sv)) ||
      (content && (content.en || content.fi || content.sv))
    messages = messages.concat(`Deleted question '${question}'`)
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

  if (isLoading) {
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
