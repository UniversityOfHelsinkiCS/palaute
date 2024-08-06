import React from 'react'
import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import LinkChip from '../../../../components/common/LinkChip'

import styles from '../../../../util/chipStyles'

const InterimFeedbackChip = ({ parentFeedbackTarget }) => {
  const { t } = useTranslation()

  if (parentFeedbackTarget) {
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

  return (
    <Chip
      onClick={undefined}
      label={t('teacherView:interimFeedbackOpen')}
      sx={styles.interim}
      variant="outlined"
      size="small"
      href={undefined}
    />
  )
}

export default InterimFeedbackChip
