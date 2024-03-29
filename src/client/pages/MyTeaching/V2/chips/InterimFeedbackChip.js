import React from 'react'
import { useTranslation } from 'react-i18next'

import LinkChip from '../../../../components/common/LinkChip'

import styles from '../../../../util/chipStyles'

const InterimFeedbackChip = ({ parentFeedbackTarget }) => {
  const { t } = useTranslation()

  const { id: parentId } = parentFeedbackTarget

  const url = `/targets/${parentFeedbackTarget.id}/interim-feedback`

  return (
    <LinkChip
      data-cy={`interim-feedback-chip-${parentId}`}
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
