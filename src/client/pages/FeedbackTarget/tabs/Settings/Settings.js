import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { Box } from '@mui/material'

import useUpdateSettingsRead from './useUpdateSettingsRead'
import EditFeedbackTarget from './EditFeedbackTarget'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import GroupingSettings from './GroupingSettings'

const Settings = () => {
  const { id } = useParams()
  const updateSettingsRead = useUpdateSettingsRead()
  const { feedbackTarget, isResponsibleTeacher, isAdmin } = useFeedbackTargetContext()

  useEffect(() => {
    if (feedbackTarget.settingsReadByTeacher || !isResponsibleTeacher || isAdmin) {
      return
    }
    updateSettingsRead.mutateAsync({ id })
  }, [])

  return (
    <Box>
      <GroupingSettings />
      <EditFeedbackTarget />
    </Box>
  )
}

export default Settings
