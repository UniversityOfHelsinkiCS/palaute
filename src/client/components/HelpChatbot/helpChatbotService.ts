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

// The seam between the chat and its backend. The rest of the module uses only what this file exports,
// so the wire format in @common/types/helpChatbot stays out of the UI. See "Backend" in documentation/help_chatbot.md.

export type Answer = { id: string; markdown: string }

const UI_LANGUAGES: LanguageId[] = ['fi', 'sv', 'en']

// The language the UI is shown in, which i18next falls back to English for
const getUiLanguage = (): LanguageId => UI_LANGUAGES.find(language => language === i18n.resolvedLanguage) ?? 'en'

// previousAnswerId is the latest answer shown in the conversation, null before the first one; the server
// keeps the history. Any rejection is shown as "No answer received", except a cancellation (see isCancelled).
export const askNorppai = async (
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

// Replaces any earlier feedback on the answer; a null rating removes it. Only a thumbs down takes a comment.
export const sendFeedback = async (answerId: string, rating: Rating | null, comment?: string) => {
  const body: PutHelpChatbotFeedbackBody = { rating, comment }
  await apiClient.put(`/help-chatbot/turns/${answerId}/feedback`, body)
}

// A request aborted through its signal
export const isCancelled = (error: unknown) => isCancel(error)
