import { Box } from '@mui/material'
import { useEffect } from 'react'

import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import EditFeedbackTarget from './EditFeedbackTarget'
import useUpdateSettingsRead from './useUpdateSettingsRead'

const Settings = () => {
  const id = useFeedbackTargetId()

  const updateSettingsRead = useUpdateSettingsRead()
  const { feedbackTarget, isResponsibleTeacher, isAdmin } = useFeedbackTargetContext()

  useEffect(() => {
    if (feedbackTarget.settingsReadByTeacher || !isResponsibleTeacher || isAdmin) {
      return
    }
    updateSettingsRead.mutateAsync({ id })
  }, [])

  return (
    <Box id="feedback-target-tab-content">
      <EditFeedbackTarget />
    </Box>
  )
}

export default Settings
