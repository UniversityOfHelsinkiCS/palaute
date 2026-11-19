import Anthropic from '@anthropic-ai/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '../../util/logger'
import { getAnthropicCompletion } from './anthropicCompletion'
import { SYSTEM_PROMPTS } from './systemPrompt'

// messages.create is mocked in every test, so no request reaches Anthropic

const { API_KEY } = vi.hoisted(() => ({ API_KEY: 'test-api-key' }))

vi.mock('../../util/config', async importOriginal => ({
  ...(await importOriginal<typeof import('../../util/config')>()),
  ANTHROPIC_API_KEY: API_KEY,
}))

const MESSAGES = [{ role: 'user' as const, content: 'How do I add a question?' }]

const message = (texts: string[], stopReason: Anthropic.StopReason = 'end_turn') => ({
  model: 'claude-haiku-5-5',
  content: [
    { type: 'thinking', thinking: '', signature: 'signature' },
    ...texts.map(text => ({ type: 'text', text, citations: null })),
  ],
  stop_reason: stopReason,
  stop_details: stopReason === 'refusal' ? { type: 'refusal', category: 'general_harms', explanation: null } : null,
  usage: {
    input_tokens: 200,
    cache_read_input_tokens: 5000,
    cache_creation_input_tokens: 800,
    output_tokens: 300,
    output_tokens_details: { thinking_tokens: 64 },
  },
})

const apiError = (status: number, type: string) =>
  Anthropic.APIError.generate(
    status,
    { type: 'error', error: { type, message: 'Details from Anthropic' } },
    undefined,
    new Headers({ 'request-id': 'req_test' })
  )

const mockCreate = () => vi.spyOn(Anthropic.Messages.prototype, 'create')

const REQUEST = { conversationId: 'conversation', language: 'fi' as const, messages: MESSAGES }

const ask = () => getAnthropicCompletion(REQUEST, new AbortController().signal)

const expectNoAnswer = async () => {
  await expect(ask()).rejects.toMatchObject({ status: 502, message: 'No answer from the language model' })
}

describe('getAnthropicCompletion', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockReturnValue(logger)
    vi.spyOn(logger, 'warn').mockReturnValue(logger)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the text, model, finish reason and usage, with the cached input in the prompt tokens', async () => {
    mockCreate().mockResolvedValue(message(['Open ', 'the survey.']) as never)

    await expect(ask()).resolves.toEqual({
      deployment: 'claude-haiku-5-5',
      model: 'claude-haiku-5-5',
      content: 'Open the survey.',
      finishReason: 'stop',
      usage: {
        promptTokens: 6000,
        cachedTokens: 5000,
        cacheWriteTokens: 800,
        completionTokens: 300,
        reasoningTokens: 64,
      },
    })
  })

  it('sends the system prompt of the UI language and the turns', async () => {
    const create = mockCreate().mockResolvedValue(message(['Öppna enkäten.']) as never)

    await getAnthropicCompletion({ ...REQUEST, language: 'sv' }, new AbortController().signal)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-5-5',
        system: [{ type: 'text', text: SYSTEM_PROMPTS.sv, cache_control: { type: 'ephemeral' } }],
        messages: MESSAGES,
        cache_control: { type: 'ephemeral' },
      }),
      expect.anything()
    )
  })

  it("aborts the request when the caller's signal does", async () => {
    const create = mockCreate().mockResolvedValue(message(['Open the survey.']) as never)
    const abortController = new AbortController()

    await getAnthropicCompletion(REQUEST, abortController.signal)
    const { signal } = create.mock.calls[0][1]!
    expect(signal?.aborted).toBe(false)
    abortController.abort()
    expect(signal?.aborted).toBe(true)
  })

  it("doesn't send sampling parameters, which the API rejects", async () => {
    const create = mockCreate().mockResolvedValue(message(['Open the survey.']) as never)

    await ask()

    const body = create.mock.calls[0][0]
    expect(body).not.toHaveProperty('temperature')
    expect(body).not.toHaveProperty('top_p')
    expect(body).not.toHaveProperty('top_k')
  })

  it('returns an answer that was cut off at the token limit as length, with a warning', async () => {
    mockCreate().mockResolvedValue(message(['Open the'], 'max_tokens') as never)

    await expect(ask()).resolves.toMatchObject({ content: 'Open the', finishReason: 'length' })
    expect(logger.warn).toHaveBeenCalled()
  })

  it('returns a refusal as an empty answer stopped by the content filter, logging the category', async () => {
    mockCreate().mockResolvedValue(message([], 'refusal') as never)

    await expect(ask()).resolves.toMatchObject({ content: '', finishReason: 'content_filter' })
    expect(logger.error).toHaveBeenCalledWith(
      '[HelpChatbot] Empty reply from Anthropic',
      expect.objectContaining({ refusalCategory: 'general_harms' })
    )
  })

  it('returns an empty answer when there is only whitespace, with an error', async () => {
    mockCreate().mockResolvedValue(message(['  \n'], 'max_tokens') as never)

    await expect(ask()).resolves.toMatchObject({ content: '  \n', finishReason: 'length' })
    expect(logger.error).toHaveBeenCalledWith('[HelpChatbot] Empty reply from Anthropic', expect.anything())
  })

  it.each([
    ['rate limiting', 429, 'rate_limit_error'],
    ['an overloaded API', 529, 'overloaded_error'],
    ['a server error', 500, 'api_error'],
  ])('fails on %s and logs the status and type', async (_, status, type) => {
    mockCreate().mockRejectedValue(apiError(status, type))

    await expectNoAnswer()
    expect(logger.error).toHaveBeenCalledWith(
      '[HelpChatbot] Anthropic request failed',
      expect.objectContaining({ status, type, requestId: 'req_test' })
    )
  })

  it('fails on a timeout', async () => {
    mockCreate().mockRejectedValue(new Anthropic.APIConnectionTimeoutError())

    await expectNoAnswer()
    expect(logger.error).toHaveBeenCalledWith(
      '[HelpChatbot] Anthropic request failed',
      expect.objectContaining({ status: undefined })
    )
  })

  it('fails on an error that is not from the SDK', async () => {
    mockCreate().mockRejectedValue(new Error('Something broke'))
    await expectNoAnswer()
  })

  it('never logs the api key', async () => {
    mockCreate().mockRejectedValue(apiError(401, 'authentication_error'))

    await expectNoAnswer()
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(API_KEY)
  })

  it('passes a cancellation through as is', async () => {
    const cancellation = new Anthropic.APIUserAbortError()
    mockCreate().mockRejectedValue(cancellation)
    const abortController = new AbortController()
    abortController.abort()

    await expect(getAnthropicCompletion(REQUEST, abortController.signal)).rejects.toBe(cancellation)
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('fails on an abort the caller did not make, which is the deadline', async () => {
    mockCreate().mockRejectedValue(new Anthropic.APIUserAbortError())

    await expectNoAnswer()
    expect(logger.error).toHaveBeenCalledWith('[HelpChatbot] Anthropic request failed', expect.anything())
  })
})
