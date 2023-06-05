import { format, parseISO } from 'date-fns'

export const getCourseStartDate = feedbackTarget =>
  format(parseISO(feedbackTarget.courseRealisation.startDate), 'yyyy-MM-dd')

export const getGroups = feedbackTarget => {
  const groupQuestion = feedbackTarget.surveys.teacherSurvey?.questions?.find(q => q.secondaryType === 'GROUPING')
  if (groupQuestion) {
    return groupQuestion.data.options.map(opt => ({
      id: opt.id,
      name: opt.label,
    }))
  }

  return feedbackTarget.groups ?? []
}
