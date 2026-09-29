import type {
  HelpChatbotTurn,
  PostHelpChatbotMessageBody,
  PostHelpChatbotMessageResponse,
} from '@common/types/helpChatbot'

import { trimHistory } from '@common/helpChatbot'
import { isCancel } from 'axios'

import type { ChatEntry } from './types'

import apiClient from '../../util/apiClient'

// The seam between the chat and its backend. The rest of the module uses only what this file exports,
// so the wire format in @common/types/helpChatbot stays out of the UI. See "Backend" in documentation/help_chatbot.md.

export type AssistantReply = { id: string; markdown: string }

// Failed questions are left out of the history
const toTurns = (entries: ChatEntry[]): HelpChatbotTurn[] =>
  entries.flatMap((entry): HelpChatbotTurn[] => {
    if (entry.role === 'assistant') return [{ role: 'assistant', content: entry.markdown }]
    return entry.status === 'failed' ? [] : [{ role: 'user', content: entry.text }]
  })

// `entries` ends with the question being asked. Only the history the server uses is sent, so a long
// conversation stays within the request size limit. Any rejection is shown as "No answer received",
// except a cancellation (see isCancelled).
export const askNorppai = async (
  conversationId: string,
  entries: ChatEntry[],
  signal: AbortSignal
): Promise<AssistantReply> => {
  const body: PostHelpChatbotMessageBody = { conversationId, messages: trimHistory(toTurns(entries)) }
  const { data } = await apiClient.post<PostHelpChatbotMessageResponse>('/help-chatbot/messages', body, { signal })
  return { id: data.message.id, markdown: data.message.content }
}

// A request aborted through its signal
export const isCancelled = (error: unknown) => isCancel(error)
