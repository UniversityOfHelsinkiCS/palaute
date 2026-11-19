import Anthropic from '@anthropic-ai/sdk'

import type { Completion, CompletionRequest, CompletionUsage } from './completion'

import { ANTHROPIC_API_KEY, HELP_CHATBOT_MODEL } from '../../util/config'
import { logger } from '../../util/logger'
import { noAnswer } from './completion'
import { SYSTEM_PROMPTS } from './systemPrompt'

// Includes the thinking tokens
const MAX_TOKENS = 4000
const TIMEOUT_MS = 60_000

// The SDK retries overloaded, rate-limited and failed requests. TIMEOUT_MS also limits all the attempts together, so
// the user never waits longer than with Azure.
let client: Anthropic | undefined
const getClient = () => (client ??= new Anthropic({ apiKey: ANTHROPIC_API_KEY, maxRetries: 2, timeout: TIMEOUT_MS }))

// Mapped to the Azure values, which the admin views and saved turns use
const FINISH_REASONS: Partial<Record<Anthropic.StopReason, string>> = {
  end_turn: 'stop',
  max_tokens: 'length',
  refusal: 'content_filter',
}

// input_tokens is only the uncached remainder, unlike Azure's prompt_tokens
const toUsage = (usage: Anthropic.Usage): CompletionUsage => {
  const cachedTokens = usage.cache_read_input_tokens ?? 0
  const cacheWriteTokens = usage.cache_creation_input_tokens ?? 0
  return {
    promptTokens: usage.input_tokens + cachedTokens + cacheWriteTokens,
    cachedTokens,
    cacheWriteTokens,
    completionTokens: usage.output_tokens,
    reasoningTokens: usage.output_tokens_details?.thinking_tokens ?? 0,
  }
}

const describeError = (error: unknown) => {
  if (!(error instanceof Anthropic.APIError))
    return { message: error instanceof Error ? error.message : 'Unknown error' }
  return { message: error.message, status: error.status, type: error.type, requestId: error.requestID }
}

// A cancellation through signal is rethrown as is
export const getAnthropicCompletion = async (
  { language, messages }: CompletionRequest,
  signal: AbortSignal
): Promise<Completion> => {
  const deadline = AbortSignal.timeout(TIMEOUT_MS)
  let response: Anthropic.Message
  try {
    response = await getClient().messages.create(
      {
        model: HELP_CHATBOT_MODEL,
        max_tokens: MAX_TOKENS,
        // The system prompt is the same for every conversation in a language, so its cache entry is shared
        system: [{ type: 'text', text: SYSTEM_PROMPTS[language], cache_control: { type: 'ephemeral' } }],
        messages,
        // Caches the conversation so far for its next question
        cache_control: { type: 'ephemeral' },
        output_config: { effort: 'low' },
      },
      { signal: AbortSignal.any([signal, deadline]) }
    )
  } catch (error) {
    // The deadline aborts the same way, but it's a failure
    if (error instanceof Anthropic.APIUserAbortError && signal.aborted) throw error
    logger.error('[HelpChatbot] Anthropic request failed', { ...describeError(error), timedOut: deadline.aborted })
    throw noAnswer()
  }

  const content = response.content.flatMap(block => (block.type === 'text' ? [block.text] : [])).join('')
  const finishReason = response.stop_reason && (FINISH_REASONS[response.stop_reason] ?? response.stop_reason)
  const usage = toUsage(response.usage)

  if (content.trim() === '')
    logger.error('[HelpChatbot] Empty reply from Anthropic', {
      finishReason,
      refusalCategory: response.stop_details?.category,
      usage,
    })
  else if (finishReason === 'length') logger.warn('[HelpChatbot] Reply was cut off at the token limit', { usage })

  return { deployment: HELP_CHATBOT_MODEL, model: response.model, content, finishReason, usage }
}
