const feedbackTargetIsOpen = (feedbackTarget) => {
  if (!feedbackTarget?.opensAt || !feedbackTarget?.closesAt) {
    return true
  }

  const { opensAt, closesAt } = feedbackTarget
  const now = new Date()

  return new Date(opensAt) <= now && new Date(closesAt) >= now
}

export default feedbackTargetIsOpen
