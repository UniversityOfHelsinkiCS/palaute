import type { HelpChatbotTurn } from '@common/types/helpChatbot'

import { isCancel } from 'axios'

import type { ChatEntry } from './types'

import { mockSendHelpChatbotMessage } from './mockHelpChatbotService'

// The seam between the chat and its backend. The rest of the module uses only what this file exports,
// so plugging in the real backend means changing this file, the wire types in @common/types/helpChatbot
// and deleting the mock. See "Backend integration" in documentation/help_chatbot.md.

export type AssistantReply = { id: string; markdown: string }

// Failed questions are left out of the history
const toTurns = (entries: ChatEntry[]): HelpChatbotTurn[] =>
  entries.flatMap((entry): HelpChatbotTurn[] => {
    if (entry.role === 'assistant') return [{ role: 'assistant', content: entry.markdown }]
    return entry.status === 'failed' ? [] : [{ role: 'user', content: entry.text }]
  })

// `entries` ends with the question being asked. Any rejection is shown as "No answer received",
// except a cancellation (see isCancelled).
export const askNorppai = async (
  conversationId: string,
  entries: ChatEntry[],
  signal: AbortSignal
): Promise<AssistantReply> => {
  // Placeholder: apiClient.post<PostHelpChatbotMessageResponse>(path, body, { signal }) once the backend exists
  const { message } = await mockSendHelpChatbotMessage({ conversationId, messages: toTurns(entries) }, { signal })
  return { id: message.id, markdown: message.content }
}

// A request aborted through its signal, by the mock or by axios
export const isCancelled = (error: unknown) =>
  isCancel(error) || (error instanceof DOMException && error.name === 'AbortError')
