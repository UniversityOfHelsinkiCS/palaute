import feedbackTargetIsOld from '../../../../util/feedbackTargetIsOld'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'

const getLatestFeedbackTarget = courseRealisations => {
  if (courseRealisations.length === 0) return true

  const latestCourseRealisation = courseRealisations[0]

  const { feedbackTargets } = latestCourseRealisation
  const latestFeedbackTarget = feedbackTargets[0]

  const isOld = feedbackTargetIsOld(latestFeedbackTarget)
  const isEnded = feedbackTargetIsEnded(latestFeedbackTarget)

  return { ...latestFeedbackTarget, isOld, isEnded }
}

export const hasOngoingInterimFeedbacks = interimFeedbacktargets =>
  interimFeedbacktargets.some(interimFeedbackTarget => feedbackTargetIsOpen(interimFeedbackTarget))

export default getLatestFeedbackTarget
