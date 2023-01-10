import { format, parseISO } from 'date-fns'

export const getCourseStartDate = feedbackTarget =>
  format(parseISO(feedbackTarget.courseRealisation.startDate), 'yyyy-MM-dd')
