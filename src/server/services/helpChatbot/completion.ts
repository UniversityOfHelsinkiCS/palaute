import type { LanguageId } from '@common/types/common'

import type { ChatMessage } from './history'

import { ApplicationError } from '../../util/ApplicationError'

export type CompletionUsage = {
  promptTokens: number
  cachedTokens: number
  cacheWriteTokens: number
  completionTokens: number
  reasoningTokens: number
}

export type CompletionRequest = {
  conversationId: string
  language: LanguageId
  // The trimmed history, ending with the question
  messages: ChatMessage[]
}

// content is empty when reasoning used up the token limit or the content filter stopped the answer. The tokens
// are billed all the same. finishReason uses the values of the turns answered through Azure, e.g. length when cut off at the token limit.
export type Completion = {
  deployment: string
  // The model version the provider reports
  model: string | null
  content: string
  finishReason: string | null
  usage: CompletionUsage | null
}

export const noAnswer = () => new ApplicationError('No answer from the language model', 502)
