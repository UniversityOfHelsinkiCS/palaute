import React, { useEffect } from 'react'
import { Box } from '@mui/material'

import useUpdateSettingsRead from './useUpdateSettingsRead'
import EditFeedbackTarget from './EditFeedbackTarget'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import useFeedbackTargetId from '../../useFeedbackTargetId'

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
