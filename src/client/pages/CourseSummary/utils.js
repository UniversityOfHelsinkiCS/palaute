import { isBefore, parseISO } from 'date-fns'

export const getFeedbackResponseGiven = (feedbackResponseGiven, closesAt) => {
  if (isBefore(Date.now(), parseISO(closesAt))) return 'OPEN'

  return feedbackResponseGiven ? 'GIVEN' : 'NONE'
}
