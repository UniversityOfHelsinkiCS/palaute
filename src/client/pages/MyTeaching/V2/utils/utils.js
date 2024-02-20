import feedbackTargetIsOld from '../../../../util/feedbackTargetIsOld'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'

const latestCourseRealisationFeedbackResponseGiven = courseRealisations => {
  if (courseRealisations.length === 0) return true

  const latestCourseRealisation = courseRealisations[0]

  const { feedbackTargets } = latestCourseRealisation
  const latestFeedbackTarget = feedbackTargets[0]

  const isOld = feedbackTargetIsOld(latestFeedbackTarget)
  const isEnded = feedbackTargetIsEnded(latestFeedbackTarget)
  const { feedbackResponseGiven, feedbackCount } = latestFeedbackTarget

  if (!isOld && isEnded && !feedbackResponseGiven && feedbackCount > 0) return { ...latestFeedbackTarget, isOld }

  return null
}

export default latestCourseRealisationFeedbackResponseGiven
