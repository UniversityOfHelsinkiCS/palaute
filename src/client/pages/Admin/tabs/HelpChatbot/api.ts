import type {
  GetHelpChatbotConversationResponse,
  GetHelpChatbotConversationsQuery,
  GetHelpChatbotConversationsResponse,
  GetHelpChatbotFeedbackQuery,
  GetHelpChatbotFeedbackResponse,
  GetHelpChatbotMetaResponse,
  GetHelpChatbotUsageQuery,
  GetHelpChatbotUsageResponse,
  PutHelpChatbotReviewedBody,
} from '@common/types/helpChatbotAdmin'

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import apiClient from '../../../../util/apiClient'

// The NorppAI viewer's backend, /admin/help-chatbot. Every query key starts with 'helpChatbot', so marking feedback
// reviewed can refresh them all.

const get = async <T>(path: string, params: object = {}) => {
  const { data } = await apiClient.get<T>(`/admin/help-chatbot${path}`, { params })
  return data
}

export type ConversationKey = { conversationId: string; userId: string | null }

export const useHelpChatbotMeta = () =>
  useQuery({ queryKey: ['helpChatbot', 'meta'], queryFn: () => get<GetHelpChatbotMetaResponse>('/meta') })

export const useHelpChatbotConversations = (query: Omit<GetHelpChatbotConversationsQuery, 'offset'>) =>
  useInfiniteQuery({
    queryKey: ['helpChatbot', 'conversations', query],
    queryFn: ({ pageParam }) =>
      get<GetHelpChatbotConversationsResponse>('/conversations', { ...query, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((count, page) => count + page.conversations.length, 0)
      return loaded < last.total ? loaded : undefined
    },
    placeholderData: keepPreviousData,
  })

export const useHelpChatbotConversation = (key: ConversationKey | null) =>
  useQuery({
    queryKey: ['helpChatbot', 'conversation', key],
    queryFn: () =>
      get<GetHelpChatbotConversationResponse>('/conversation', {
        conversationId: key?.conversationId,
        userId: key?.userId ?? undefined,
      }),
    enabled: key !== null,
  })

export const useHelpChatbotFeedback = (query: GetHelpChatbotFeedbackQuery) =>
  useQuery({
    queryKey: ['helpChatbot', 'feedback', query],
    queryFn: () => get<GetHelpChatbotFeedbackResponse>('/feedback', query),
    placeholderData: keepPreviousData,
  })

export const useHelpChatbotUsage = (query: GetHelpChatbotUsageQuery) =>
  useQuery({
    queryKey: ['helpChatbot', 'usage', query],
    queryFn: () => get<GetHelpChatbotUsageResponse>('/usage', query),
    placeholderData: keepPreviousData,
  })

export const useSetReviewed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ turnId, reviewed }: { turnId: string } & PutHelpChatbotReviewedBody) => {
      const body: PutHelpChatbotReviewedBody = { reviewed }
      await apiClient.put(`/admin/help-chatbot/turns/${turnId}/reviewed`, body)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['helpChatbot'] }),
  })
}
