import { Alert, Box, Typography } from '@mui/material'
import { format } from 'date-fns'
import React from 'react'
import useFeedbackTargetLogs from '../../../../hooks/useFeedbackTargetLogs'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { OpenFeedbackContainer } from '../../../../components/OpenFeedback/OpenFeedback'
import { getLanguageValue } from '../../../../util/languageUtils'
import useFeedbackTargetId from '../../useFeedbackTargetId'

const getLogMessage = data => {
  if (!data) {
    return 'Unknown action wtf'
  }

  let messages = []
  if (data.opensAt) {
    messages = messages.concat(`Set feedback period to open at ${format(new Date(data.opensAt), 'yyyy/MM/dd')}`)
  }

  if (data.closesAt) {
    messages = messages.concat(`Set feedback period to close at ${format(new Date(data.closesAt), 'yyyy/MM/dd')}`)
  }

  if (data.feedbackVisibility) {
    messages = messages.concat(
      data.feedbackVisibility === 'ALL'
        ? 'Set public questions visible to all students'
        : 'Set public questions visible to enrolled students'
    )
  }

  if (data.enabledPublicQuestions?.length) {
    const questionName = getLanguageValue(data.enabledPublicQuestions[0]?.data?.label, 'fi')
    messages = messages.concat(`Set answers visible for question '${questionName}'`)
  }

  if (data.disabledPublicQuestions?.length) {
    const questionName = getLanguageValue(data.disabledPublicQuestions[0]?.data?.label, 'fi')
    messages = messages.concat(`Set answers hidden for question '${questionName}'`)
  }

  if (data.openImmediately !== undefined) {
    messages = messages.concat(
      data.openImmediately ? 'Opened feedback period immediately' : 'Closed feedback period immediately'
    )
  }

  if (data.createQuestion) {
    const { label, content } = data.createQuestion
    const question = getLanguageValue(label, 'fi') || getLanguageValue(content, 'fi')
    messages = messages.concat(`Added question '${question}'`)
  }

  if (data.deleteQuestion) {
    const { label, content } = data.deleteQuestion
    const question = getLanguageValue(label, 'fi') || getLanguageValue(content, 'fi')
    messages = messages.concat(`Deleted question '${question}'`)
  }

  if (data.updateQuestion) {
    const { previousLabel, required } = data.updateQuestion
    const genericMessage = `Updated question '${previousLabel}'`

    messages = messages.concat(genericMessage)
    if (required !== undefined) {
      messages = required ? messages.concat(`Set question as required`) : messages.concat(`Set question as voluntary`)
    }
  }

  return messages.join(', ')
}

const LogItem = ({ log }) => (
  <OpenFeedbackContainer>
    <Box display="flex" gap="1rem" alignItems="end">
      <Typography variant="body2" color="text.secondary">
        {format(new Date(log.createdAt), 'hh:mm dd.MM.yyyy')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {log.user.email}
      </Typography>
      <Typography>{getLogMessage(log.data)}</Typography>
    </Box>
  </OpenFeedbackContainer>
)

const Logs = () => {
  const id = useFeedbackTargetId()

  const { feedbackTargetLogs, isLoading } = useFeedbackTargetLogs(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box display="flex" flexDirection="column">
      {!feedbackTargetLogs?.length > 0 && <Alert severity="info">No logs yet</Alert>}
      {feedbackTargetLogs.map((log, idx) => (
        <LogItem key={idx} log={log} />
      ))}
    </Box>
  )
}

export default Logs
