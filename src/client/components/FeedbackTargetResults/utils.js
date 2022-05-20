import { format } from 'date-fns'

export const feedbackCanBeClosed = (feedbackTarget) => {
  const { opensAt } = feedbackTarget
  const openTime = new Date() - new Date(opensAt)

  return openTime >= 86400000
}

export const formatClosesAt = (closesAt) =>
  format(new Date(closesAt), 'dd.MM.yyyy')
