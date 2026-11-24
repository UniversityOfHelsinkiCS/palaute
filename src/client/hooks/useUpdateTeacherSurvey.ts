import type { Question } from '@common/types/question'

import { useMutation } from '@tanstack/react-query'

import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

type QuestionsPayload = { questions: unknown[]; questionsVersion: number }

type SavedQuestions = { questions: Question[]; createdIds: Record<string, number>; questionsVersion: number }

const useUpdateTeacherSurvey = (feedbackTarget: { id: number }) => {
  const { id } = feedbackTarget

  return useMutation({
    mutationFn: async (payload: QuestionsPayload) =>
      (await apiClient.put<SavedQuestions>(`/feedback-targets/${id}/questions`, payload)).data,
    onSuccess: () => queryClient.refetchQueries({ queryKey: ['feedbackTarget', String(id)] }),
  })
}

export default useUpdateTeacherSurvey
