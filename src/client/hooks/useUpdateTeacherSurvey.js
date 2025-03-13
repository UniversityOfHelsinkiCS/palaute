import { useMutation } from '@tanstack/react-query'
import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

const useUpdateTeacherSurvey = feedbackTarget => {
  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const mutationFn = async ({ questions, groupingQuestion }) => {
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
      queryClient.refetchQueries(['feedbackTarget', String(id)])
    },
  })

  return mutation
}

export default useUpdateTeacherSurvey
