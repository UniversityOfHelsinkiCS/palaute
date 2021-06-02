import { isBefore, parseISO } from 'date-fns'

export const getFeedbackResponseGiven = (courseRealisation) => {
  if (!courseRealisation.feedbackTarget) return 'NONE'

  if (isBefore(Date.now(), parseISO(courseRealisation.feedbackTarget.closesAt)))
    return 'OPEN'

  return courseRealisation.feedbackTarget.feedbackResponse ? 'GIVEN' : 'NONE'
}
