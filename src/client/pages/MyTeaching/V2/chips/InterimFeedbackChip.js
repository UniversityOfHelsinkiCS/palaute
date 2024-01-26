import React from 'react'
import { useTranslation } from 'react-i18next'

import LinkChip from '../../../../components/common/LinkChip'

import styles from '../../../../util/chipStyles'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../../../util/feedbackTargetIsOld'

import { useInterimFeedbacks } from '../../../FeedbackTarget/tabs/InterimFeedback/useInterimFeedbacks'

const InterimFeedbackChip = ({ parentFeedbackTarget }) => {
  const { t } = useTranslation()

  const isEnded = feedbackTargetIsEnded(parentFeedbackTarget)
  const isOld = feedbackTargetIsOld(parentFeedbackTarget)

  const url = `/targets/${parentFeedbackTarget.id}/interim-feedback`

  const fetchInterimFeedbacks = !isEnded && !isOld

  const { interimFeedbacks, isLoading } = useInterimFeedbacks(parentFeedbackTarget?.id, fetchInterimFeedbacks)

  if (!fetchInterimFeedbacks || isLoading || interimFeedbacks?.length === 0) return null

  // Because the query returns all of the interim feedbacks, check if some of these are open
  const isOpenInterim = interimFeedbacks.some(target => feedbackTargetIsOpen(target))
  if (!isOpenInterim) return null

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
