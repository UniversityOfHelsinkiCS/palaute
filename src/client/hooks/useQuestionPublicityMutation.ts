import { useMutation } from '@tanstack/react-query'
import { kebabCase } from 'lodash-es'

import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

type UseQuestionPublicityMutationParams = {
  resource: 'feedbackTarget' | 'organisation'
  resourceId: number | string
}

type QuestionPublicity = { questionId: number; isPublic: boolean }

const useQuestionPublicityMutation = ({ resource, resourceId }: UseQuestionPublicityMutationParams) =>
  useMutation({
    mutationFn: async (publicity: QuestionPublicity) => {
      const res = await apiClient.put<{ publicQuestionIds: number[] }>(
        `/${kebabCase(resource)}s/${resourceId}/question-publicity`,
        publicity
      )
      return res.data.publicQuestionIds
    },
    onSuccess: publicQuestionIds => {
      queryClient.setQueryData([resource, String(resourceId)], (current: Record<string, unknown>) => ({
        ...current,
        publicQuestionIds,
      }))
    },
  })

export default useQuestionPublicityMutation
