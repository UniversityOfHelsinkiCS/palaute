import type { LanguageId } from '@common/types/common'

import axios, { isAxiosError, isCancel } from 'axios'

import type { ChatMessage } from './history'

import { ApplicationError } from '../../util/ApplicationError'
import { AZURE_API_KEY, AZURE_RESOURCE, HELP_CHATBOT_MODEL } from '../../util/config'
import { logger } from '../../util/logger'
import { SYSTEM_PROMPTS } from './systemPrompt'

// Accepts reasoning_effort for the GPT-5 models
const API_VERSION = '2024-10-21'
// Includes the reasoning tokens
const MAX_COMPLETION_TOKENS = 4000
const TIMEOUT_MS = 60_000

export type CompletionUsage = {
  promptTokens: number
  cachedTokens: number
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
// are billed all the same.
export type Completion = {
  deployment: string
  // The model version Azure reports
  model: string | null
  content: string
  finishReason: string | null
  usage: CompletionUsage | null
}

type AzureChatCompletion = {
  model?: string
  choices?: { message?: { content?: string | null }; finish_reason?: string | null }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    prompt_tokens_details?: { cached_tokens?: number }
    completion_tokens_details?: { reasoning_tokens?: number }
  }
}

const toUsage = (usage: AzureChatCompletion['usage']): CompletionUsage | null =>
  usage
    ? {
        promptTokens: usage.prompt_tokens,
        cachedTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
        completionTokens: usage.completion_tokens,
        reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? 0,
      }
    : null

// Never log the axios error itself: its config carries the api-key header
const describeError = (error: unknown) => {
  if (!isAxiosError<{ error?: { code?: string } }>(error))
    return { message: error instanceof Error ? error.message : 'Unknown error' }
  return {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    azureCode: error.response?.data?.error?.code,
  }
}

export const noAnswer = () => new ApplicationError('No answer from the language model', 502)

// A cancellation through signal is rethrown as is
export const getAzureCompletion = async (
  { language, messages }: CompletionRequest,
  signal: AbortSignal
): Promise<Completion> => {
  const url = `https://${AZURE_RESOURCE}.openai.azure.com/openai/deployments/${HELP_CHATBOT_MODEL}/chat/completions`

  // GPT-5 models are reasoning models: they take max_completion_tokens and reject a non-default temperature
  const body = {
    messages: [{ role: 'system', content: SYSTEM_PROMPTS[language] }, ...messages],
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    reasoning_effort: 'low',
  }

  let data: AzureChatCompletion
  try {
    ;({ data } = await axios.post<AzureChatCompletion>(url, body, {
      params: { 'api-version': API_VERSION },
      headers: { 'api-key': AZURE_API_KEY },
      timeout: TIMEOUT_MS,
      signal,
    }))
  } catch (error) {
    if (isCancel(error)) throw error
    logger.error('[HelpChatbot] Azure request failed', describeError(error))
    throw noAnswer()
  }

  const choice = data.choices?.[0]
  const content = choice?.message?.content ?? ''
  const finishReason = choice?.finish_reason ?? null
  const usage = toUsage(data.usage)

  if (content.trim() === '') logger.error('[HelpChatbot] Empty reply from Azure', { finishReason, usage })
  else if (finishReason === 'length') logger.warn('[HelpChatbot] Reply was cut off at the token limit', { usage })

  return { deployment: HELP_CHATBOT_MODEL, model: data.model ?? null, content, finishReason, usage }
}
