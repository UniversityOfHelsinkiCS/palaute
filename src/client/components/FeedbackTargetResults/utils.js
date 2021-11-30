import { set } from 'date-fns'

import apiClient from '../../util/apiClient'

export const closeCourseImmediately = async (feedbackTarget, difference) => {
  const currentDate = new Date()
  const { id } = feedbackTarget
  const closesAt =
    difference > 1
      ? currentDate
      : set(currentDate, {
          date: currentDate.getDate() + 1,
          hours: 23,
          minutes: 59,
        })

  const payload = {
    closesAt,
  }

  const { data } = await apiClient.put(
    `/feedback-targets/${id}/close-immediately`,
    payload,
  )

  return data
}

export const feedbackCanBeClosed = (feedbackTarget) => {
  const { opensAt } = feedbackTarget
  const openTime = new Date() - new Date(opensAt)

  return openTime >= 86400000
}
