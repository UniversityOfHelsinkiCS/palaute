import type {
  GetNorppaiConversationResponse,
  GetNorppaiConversationsQuery,
  GetNorppaiConversationsResponse,
  GetNorppaiFeedbackQuery,
  GetNorppaiFeedbackResponse,
  GetNorppaiMetaResponse,
  GetNorppaiUsageQuery,
  GetNorppaiUsageResponse,
  PutNorppaiReviewedBody,
} from '@common/types/helpChatbotAdmin'

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import apiClient from '../../../../util/apiClient'

// The NorppAI viewer's backend, /admin/norppai. Every query key starts with 'norppai', so marking feedback
// reviewed can refresh them all.

const get = async <T>(path: string, params: object = {}) => {
  const { data } = await apiClient.get<T>(`/admin/norppai${path}`, { params })
  return data
}

export type ConversationKey = { conversationId: string; userId: string | null }

export const useNorppaiMeta = () =>
  useQuery({ queryKey: ['norppai', 'meta'], queryFn: () => get<GetNorppaiMetaResponse>('/meta') })

export const useNorppaiConversations = (query: Omit<GetNorppaiConversationsQuery, 'offset'>) =>
  useInfiniteQuery({
    queryKey: ['norppai', 'conversations', query],
    queryFn: ({ pageParam }) => get<GetNorppaiConversationsResponse>('/conversations', { ...query, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((count, page) => count + page.conversations.length, 0)
      return loaded < last.total ? loaded : undefined
    },
    placeholderData: keepPreviousData,
  })

export const useNorppaiConversation = (key: ConversationKey | null) =>
  useQuery({
    queryKey: ['norppai', 'conversation', key],
    queryFn: () =>
      get<GetNorppaiConversationResponse>('/conversation', {
        conversationId: key?.conversationId,
        userId: key?.userId ?? undefined,
      }),
    enabled: key !== null,
  })

export const useNorppaiFeedback = (query: GetNorppaiFeedbackQuery) =>
  useQuery({
    queryKey: ['norppai', 'feedback', query],
    queryFn: () => get<GetNorppaiFeedbackResponse>('/feedback', query),
    placeholderData: keepPreviousData,
  })

export const useNorppaiUsage = (query: GetNorppaiUsageQuery) =>
  useQuery({
    queryKey: ['norppai', 'usage', query],
    queryFn: () => get<GetNorppaiUsageResponse>('/usage', query),
    placeholderData: keepPreviousData,
  })

export const useSetReviewed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ turnId, reviewed }: { turnId: string } & PutNorppaiReviewedBody) => {
      const body: PutNorppaiReviewedBody = { reviewed }
      await apiClient.put(`/admin/norppai/turns/${turnId}/reviewed`, body)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['norppai'] }),
  })
}
