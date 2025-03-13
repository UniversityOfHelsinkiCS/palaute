import { endOfDay, startOfDay } from 'date-fns'
import { useMutation } from '@tanstack/react-query'
import apiClient from '../../../util/apiClient'
import { updateCache } from '../../../util/reactQuery'

const updateDates = async (values, feedbackTarget) => {
  const closesAt = values.closesAt ? endOfDay(new Date(values.closesAt)) : null
  const opensAt = values.opensAt ? startOfDay(new Date(values.opensAt)) : null

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const payload = {
    surveyId,
    closesAt,
    opensAt,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}

const openFeedbackImmediately = async feedbackTarget => {
  const { id } = feedbackTarget
  const opensAt = new Date()

  const payload = {
    opensAt,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}/open-immediately`, payload)

  return data
}

export const useUpdateDates = feedbackTarget => {
  const mutation = useMutation({
    mutationFn: async dates => updateDates(dates, feedbackTarget),
    onSuccess: data => {
      updateCache(['feedbackTarget', String(feedbackTarget.id)], draft => {
        draft.opensAt = data.opensAt
        draft.closesAt = data.closesAt
      })
    },
  })

  return mutation
}

export const useOpenImmediately = feedbackTarget => {
  const mutation = useMutation({
    mutationFn: async () => openFeedbackImmediately(feedbackTarget),
    onSuccess: data => {
      updateCache(['feedbackTarget', String(feedbackTarget.id)], draft => {
        draft.opensAt = data.opensAt
      })
    },
  })

  return mutation
}
