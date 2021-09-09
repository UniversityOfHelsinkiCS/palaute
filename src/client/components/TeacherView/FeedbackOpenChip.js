import React from 'react'
import { Chip } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const FeedbackOpenChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      label={t('teacherView:feedbackOpen')}
      variant="outlined"
      size="small"
    />
  )
}

export default FeedbackOpenChip
