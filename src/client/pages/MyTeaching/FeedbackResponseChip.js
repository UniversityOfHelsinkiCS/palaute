/* eslint-disable no-nested-ternary */
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from '../../util/chipStyles'
import LinkChip from '../../components/common/LinkChip'

function getFeedbackUrl(id, interimFeedbackId, feedbackResponseSent, ongoing, continuous) {
  const baseFeedbackUrl = interimFeedbackId ? `/targets/${id}/interim-feedback/${interimFeedbackId}` : `/targets/${id}`

  if (feedbackResponseSent || ongoing) {
    return `${baseFeedbackUrl}/results`
  }
  if (continuous) {
    return `${baseFeedbackUrl}/continuous-feedback`
  }
  return `${baseFeedbackUrl}/edit-feedback-response`
}

const FeedbackResponseChip = ({
  id,
  interimFeedbackId = null,
  feedbackResponseGiven,
  feedbackResponseSent,
  isOld,
  ongoing,
  continuous,
  ...props
}) => {
  const { t } = useTranslation()

  if (isOld && (!feedbackResponseGiven || !feedbackResponseSent)) return null

  const notSentLabel = feedbackResponseGiven
    ? t('teacherView:feedbackResponseNotSent')
    : t('teacherView:feedbackResponseMissing')
  const label = feedbackResponseSent ? t('teacherView:feedbackResponseGiven') : notSentLabel
  const ongoingLabel = t('teacherView:feedbackOpen')
  const continuousLabel = t('teacherView:continuousFeedback')

  const notSentStyle = feedbackResponseGiven ? styles.warning : styles.error
  const ongoingStyle = styles.shimmering
  const continuousStyle = styles.shimmeringSecondary

  const url = getFeedbackUrl(id, interimFeedbackId, feedbackResponseSent, ongoing, continuous)

  const sx = feedbackResponseSent ? styles.success : notSentStyle

  return (
    <LinkChip
      data-cy={
        continuous
          ? `feedback-response-chip-continuous-${id}`
          : ongoing
          ? `feedbackOpen-${id}`
          : feedbackResponseGiven
          ? feedbackResponseSent
            ? `feedbackResponseGiven-${id}-${Boolean(feedbackResponseGiven)}`
            : `feedback-response-chip-not-sent-${id}`
          : `feedback-response-chip-missing-${id}`
      }
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
