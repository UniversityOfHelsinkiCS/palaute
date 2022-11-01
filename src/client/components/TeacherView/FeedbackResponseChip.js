/* eslint-disable no-nested-ternary */
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from '../../util/chipStyles'
import LinkChip from '../common/LinkChip'

const FeedbackResponseChip = ({
  id,
  feedbackResponseGiven,
  feedbackResponseSent,
  ongoing,
  continuous,
  ...props
}) => {
  const { t } = useTranslation()

  const notSentLabel = feedbackResponseGiven
    ? t('teacherView:feedbackResponseNotSent')
    : t('teacherView:feedbackResponseMissing')

  const label = feedbackResponseSent
    ? t('teacherView:feedbackResponseGiven')
    : notSentLabel

  const continuousLabel = t('teacherView:continuousFeedback')

  const ongoingLabel = t('teacherView:feedbackOpen')

  const ongoingStyle = styles.shimmering

  const continuousStyle = styles.shimmeringSecondary

  const notSentStyle = feedbackResponseGiven ? styles.warning : styles.error

  const url =
    feedbackResponseSent || ongoing
      ? `/targets/${id}/results`
      : continuous
      ? `/targets/${id}/continuous-feedback`
      : `/targets/${id}/edit-feedback-response`

  const sx = feedbackResponseSent ? styles.success : notSentStyle

  return (
    <LinkChip
      to={url}
      label={continuous ? continuousLabel : ongoing ? ongoingLabel : label}
      sx={{
        ...(continuous ? continuousStyle : ongoing ? ongoingStyle : sx),
        ...styles.interactive,
      }}
      {...props}
    />
  )
}

export default FeedbackResponseChip
