import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from '../../util/chipStyles'
import LinkChip from '../LinkChip'

const FeedbackResponseChip = ({
  id,
  feedbackResponseGiven,
  feedbackResponseSent,
  ongoing,
  ...props
}) => {
  const { t } = useTranslation()

  const notSentLabel = feedbackResponseGiven
    ? t('teacherView:feedbackResponseNotSent')
    : t('teacherView:feedbackResponseMissing')

  const label = feedbackResponseSent
    ? t('teacherView:feedbackResponseGiven')
    : notSentLabel

  const ongoingLabel = t('teacherView:feedbackOpen')

  const ongoingStyle = styles.shimmering

  const notSentStyle = feedbackResponseGiven ? styles.warning : styles.error

  const url =
    feedbackResponseSent || ongoing
      ? `/targets/${id}/results`
      : `/targets/${id}/edit-feedback-response`

  const sx = feedbackResponseSent ? styles.success : notSentStyle

  return (
    <LinkChip
      to={url}
      label={ongoing ? ongoingLabel : label}
      sx={{ ...(ongoing ? ongoingStyle : sx), ...styles.interactive }}
      {...props}
    />
  )
}

export default FeedbackResponseChip
