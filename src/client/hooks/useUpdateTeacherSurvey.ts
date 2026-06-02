import { useMutation } from '@tanstack/react-query'
import type { Question } from '@common/types/question'
import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

interface FeedbackTargetWithSurveys {
  id: number
  surveys: { teacherSurvey: { id: number } }
}

interface UpdateTeacherSurveyArgs {
  questions: (Question & { editable?: boolean })[]
  groupingQuestion?: Question | null
}

const useUpdateTeacherSurvey = (feedbackTarget: FeedbackTargetWithSurveys) => {
  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const mutationFn = async ({ questions, groupingQuestion }: UpdateTeacherSurveyArgs) => {
    const editableQuestions = questions.filter(({ editable }) => editable)
    if (groupingQuestion) {
      editableQuestions.push(groupingQuestion)
    }

    const payload = {
      surveyId,
      questions: editableQuestions,
    }

    return apiClient.put(`/feedback-targets/${id}`, payload)
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['feedbackTarget', String(id)] })
    },
  })

  return mutation
}

export default useUpdateTeacherSurvey
