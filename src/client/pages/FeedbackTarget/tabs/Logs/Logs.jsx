import { Alert, Box } from '@mui/material'
import { format } from 'date-fns'
import React from 'react'
import useFeedbackTargetLogs from '../../../../hooks/useFeedbackTargetLogs'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { getLanguageValue } from '../../../../util/languageUtils'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import { LogItem } from '../../../../components/Logs/LogItem'

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

  if (data.feedbackResponse === 'created') {
    messages = messages.concat(`Created feedback response`)
  } else if (data.feedbackResponse === 'updated') {
    messages = messages.concat(`Updated feedback response`)
  }

  if (data.sendFeedbackResponseEmail) {
    messages = messages.concat(`Sent feedback response email`)
  }

  if (data.continuousFeedbackEnabled !== undefined) {
    messages = data.continuousFeedbackEnabled
      ? messages.concat(`Enabled continuous feedback`)
      : messages.concat(`Disabled continuous feedback`)
  }

  if (data.sendContinuousFeedbackDigestEmails !== undefined) {
    messages = data.sendContinuousFeedbackDigestEmails
      ? messages.concat(`Enabled continuous feedback digest mail`)
      : messages.concat(`Disabled continuous feedback digest mail`)
  }

  if (data.mockedBy) {
    messages = messages.concat(`(Mocked by ${data.mockedBy})`)
  }

  return messages.join(', ')
}

const Logs = () => {
  const id = useFeedbackTargetId()

  const { feedbackTargetLogs, isLoading } = useFeedbackTargetLogs(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box id="feedback-target-tab-content" display="flex" flexDirection="column">
      {!feedbackTargetLogs?.length > 0 && <Alert severity="info">No logs yet</Alert>}
      {feedbackTargetLogs.map((log, idx) => (
        <LogItem key={idx} log={log} parseLogMessage={getLogMessage} />
      ))}
    </Box>
  )
}

export default Logs
