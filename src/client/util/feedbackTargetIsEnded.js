const feedbackTargetIsEnded = (feedbackTarget) => {
  if (!feedbackTarget?.closesAt) {
    return true
  }

  const { closesAt } = feedbackTarget
  const now = new Date()

  return now > new Date(closesAt)
}

export default feedbackTargetIsEnded
