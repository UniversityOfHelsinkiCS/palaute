import { parseISO, format } from 'date-fns'

import apiClient from '../../util/apiClient'

export const getCoursePeriod = (courseRealisation) => {
  if (!courseRealisation) {
    return null
  }

  const startDate = format(parseISO(courseRealisation.startDate), 'dd.MM.yyyy')
  const endDate = format(parseISO(courseRealisation.endDate), 'dd.MM.yyyy')

  return `${startDate} - ${endDate}`
}

export const getFeedbackPeriod = (feedbackTarget) => {
  const opensAt = format(parseISO(feedbackTarget.opensAt), 'dd.MM.yyyy')
  const closesAt = format(parseISO(feedbackTarget.closesAt), 'dd.MM.yyyy')

  return `${opensAt} - ${closesAt}`
}

export const getCoursePageUrl = (feedbackTarget) =>
  `https://studies.helsinki.fi/opintotarjonta/cur/${feedbackTarget.courseRealisation.id}`

export const saveValues = async (values, feedbackTarget) => {
  const { answers } = values

  const feedbackData = Object.entries(answers).map(([questionId, data]) => ({
    questionId: Number(questionId),
    data,
  }))

  const { id: feedbackTargetId, feedback } = feedbackTarget

  if (feedback) {
    const { data } = await apiClient.put(`/noad/feedbacks/${feedback.id}`, {
      data: feedbackData,
    })

    return data
  }

  const { data } = await apiClient.post('/noad/feedbacks', {
    feedbackTargetId,
    data: feedbackData,
  })

  return data
}
