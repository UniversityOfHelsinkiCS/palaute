import React from 'react'

import FeedbackResponseChip from '../../FeedbackResponseChip'

import { useInterimFeedbackParent } from '../../../FeedbackTarget/tabs/InterimFeedback/useInterimFeedbacks'

import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../../../util/feedbackTargetIsOld'
import feedbackTargetCourseIsOngoing from '../../../../util/feedbackTargetCourseIsOngoing'

const RenderFeedbackResponseChip = ({ courseRealisation, code }) => {
  const { feedbackResponseGiven, feedbackResponseSent, feedbackTarget, feedbackCount } = courseRealisation

  const { parentFeedback } = useInterimFeedbackParent(feedbackTarget.id, feedbackTarget.userCreated)

  const acualFeedback = parentFeedback || feedbackTarget

  const isEnded = feedbackTargetIsEnded(acualFeedback)
  const isOpen = feedbackTargetIsOpen(acualFeedback)
  const isOld = feedbackTargetIsOld(acualFeedback)
  const { id: feedbackTargetId, continuousFeedbackEnabled, opensAt } = acualFeedback || {}
  const isOngoing = feedbackTargetCourseIsOngoing({ opensAt, courseRealisation }) && !isOpen

  if (isOpen || (isOngoing && continuousFeedbackEnabled) || (feedbackCount > 0 && isEnded) || feedbackResponseGiven) {
    return (
      <FeedbackResponseChip
        id={feedbackTargetId}
        feedbackResponseGiven={feedbackResponseGiven}
        feedbackResponseSent={feedbackResponseSent}
        isOld={isOld}
        ongoing={isOpen}
        continuous={isOngoing && continuousFeedbackEnabled}
        data-cy={`feedbackResponseGiven-${code}-${feedbackResponseGiven}`}
      />
    )
  }

  return null
}

export default RenderFeedbackResponseChip
