import type { LanguageId } from '@common/types/common'
import type {
  PostHelpChatbotTurnBody,
  PostHelpChatbotTurnResponse,
  PutHelpChatbotFeedbackBody,
} from '@common/types/helpChatbot'

import { isCancel } from 'axios'
import i18n from 'i18next'

import type { Rating } from './types'

import apiClient from '../../util/apiClient'

// The only file in the chat that knows the backend's wire format

export type Answer = { id: string; markdown: string }

const UI_LANGUAGES: LanguageId[] = ['fi', 'sv', 'en']

const getUiLanguage = (): LanguageId => UI_LANGUAGES.find(language => language === i18n.resolvedLanguage) ?? 'en'

// The server keeps the history: previousAnswerId is the latest answer shown, null before the first one
export const askQuestion = async (
  conversationId: string,
  previousAnswerId: string | null,
  question: string,
  signal: AbortSignal
): Promise<Answer> => {
  const body: PostHelpChatbotTurnBody = {
    conversationId,
    previousTurnId: previousAnswerId,
    language: getUiLanguage(),
    question,
  }
  const { data } = await apiClient.post<PostHelpChatbotTurnResponse>('/help-chatbot/turns', body, { signal })
  return { id: data.id, markdown: data.answer }
}

// Replaces any earlier feedback; a null rating removes it
export const sendFeedback = async (answerId: string, rating: Rating | null, comment?: string) => {
  const body: PutHelpChatbotFeedbackBody = { rating, comment }
  await apiClient.put(`/help-chatbot/turns/${answerId}/feedback`, body)
}

export const isCancelled = (error: unknown) => isCancel(error)
