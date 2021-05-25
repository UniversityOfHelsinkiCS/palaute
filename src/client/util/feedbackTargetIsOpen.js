import { parseISO, getYear } from 'date-fns'

const feedbackTargetIsOpen = (feedbackTarget) => {
  if (!feedbackTarget?.opensAt || !feedbackTarget?.closesAt) {
    return true
  }

  if (getYear(parseISO(feedbackTarget.opensAt)) === 2019) return false

  const { opensAt, closesAt } = feedbackTarget
  const now = new Date()

  return new Date(opensAt) <= now && new Date(closesAt) >= now
}

export default feedbackTargetIsOpen
