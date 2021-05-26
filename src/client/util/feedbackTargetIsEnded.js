import { parseISO, getYear } from 'date-fns'

const feedbackTargetIsEnded = (feedbackTarget) => {
  if (!feedbackTarget?.closesAt) {
    return true
  }

  const { closesAt } = feedbackTarget
  const now = new Date()

  if (getYear(parseISO(closesAt)) === 2019) return false

  return now > new Date(closesAt)
}

export default feedbackTargetIsEnded
