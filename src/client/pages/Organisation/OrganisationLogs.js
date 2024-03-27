import { Box } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router'
import useOrganisationLogs from '../../hooks/useOrganisationLogs'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { LogItem } from '../../components/Logs/LogItem'

const getLogMessage = data => {
  let messages = []
  if (data.studentListVisible !== undefined) {
    messages = messages.concat(data.studentListVisible ? 'Set student list as visible' : 'Set student list as hidden')
  }

  if (data.enabledCourseCodes) {
    messages = messages.concat(
      data.enabledCourseCodes.length > 0
        ? `Enabled feedback for course ${data.enabledCourseCodes[0]}`
        : `Disabled feedback for course ${data.disabledCourseCodes[0]}`
    )
  }

  if (data.addedPublicQuestionIds) {
    messages = messages.concat(
      data.addedPublicQuestionIds.length > 0
        ? `Set question ${data.addedPublicQuestionIds[0]} public`
        : `Unset question ${data.removedPublicQuestionIds[0]} public`
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
      `Added ${data.newFeedbackCorrespondent?.firstName} ${data.newFeedbackCorrespondent?.lastName} to the feedback correspondents`
    )
  }

  if (data.removedFeedbackCorrespondent !== undefined) {
    messages = messages.concat(
      `Removed ${data.removedFeedbackCorrespondent?.firstName} ${data.removedFeedbackCorrespondent?.lastName} from the feedback correspondents`
    )
  }

  if (data.createQuestion) {
    const { label, content } = data.createQuestion
    const question =
      (label && (label.en || label.fi || label.sv)) || (content && (content.en || content.fi || content.sv))
    messages = messages.concat(`Added question '${question}'`)
  }

  if (data.deleteQuestion) {
    const { label, content } = data.deleteQuestion
    const question =
      (label && (label.en || label.fi || label.sv)) || (content && (content.en || content.fi || content.sv))
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

  if (data.mockedBy) {
    messages = messages.concat(`(Mocked by ${data.mockedBy})`)
  }

  return messages.join(', ')
}

const OrganisationLogs = () => {
  const { code } = useParams()
  const { organisationLogs, isLoading } = useOrganisationLogs(code)

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box display="flex" flexDirection="column">
      {organisationLogs.map((log, idx) => (
        <LogItem key={idx} log={log} parseLogMessage={getLogMessage} />
      ))}
    </Box>
  )
}

export default OrganisationLogs
