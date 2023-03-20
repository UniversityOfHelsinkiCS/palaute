import { useMutation } from 'react-query'
import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

const useUpdateTeacherSurvey = feedbackTarget => {
  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const mutationFn = async ({ questions }) => {
    const editableQuestions = questions.filter(({ editable }) => editable)

    const payload = {
      surveyId,
      questions: editableQuestions,
    }

    return apiClient.put(`/feedback-targets/${id}`, payload)
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.refetchQueries(['feedbackTarget', String(id)])
    },
  })

  return mutation
}

export default useUpdateTeacherSurvey
