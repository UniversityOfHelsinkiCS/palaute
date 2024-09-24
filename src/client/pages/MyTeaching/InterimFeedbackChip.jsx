import React from 'react'
import { useTranslation } from 'react-i18next'

import { useInterimFeedbackParent } from '../FeedbackTarget/tabs/InterimFeedback/useInterimFeedbacks'

import LinkChip from '../../components/common/LinkChip'

import styles from '../../util/chipStyles'

const InterimFeedbackChip = ({ id }) => {
  const { t } = useTranslation()
  const { parentFeedback, isLoading } = useInterimFeedbackParent(id)

  if (isLoading || !parentFeedback) return null

  const url = `/targets/${parentFeedback.id}/interim-feedback`

  return (
    <LinkChip
      to={url}
      label={t('teacherView:interimFeedbackOpen')}
      sx={{
        ...styles.interim,
        ...styles.interactive,
      }}
    />
  )
}

export default InterimFeedbackChip
