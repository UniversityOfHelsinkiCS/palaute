import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import axios, { AxiosError, AxiosHeaders, CanceledError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '../../util/logger'
import { getAzureCompletion } from './azureCompletion'
import { SYSTEM_PROMPTS } from './systemPrompt'

// axios.post is mocked in every test, so no request reaches Azure

const { API_KEY } = vi.hoisted(() => ({ API_KEY: 'test-api-key' }))

vi.mock('../../util/config', async importOriginal => ({
  ...(await importOriginal<typeof import('../../util/config')>()),
  AZURE_API_KEY: API_KEY,
  AZURE_RESOURCE: 'test-resource',
  HELP_CHATBOT_MODEL: 'gpt-5-mini',
}))

const MESSAGES = [{ role: 'user' as const, content: 'How do I add a question?' }]

const requestConfig = (): InternalAxiosRequestConfig => ({ headers: new AxiosHeaders({ 'api-key': API_KEY }) })

const response = <T>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: '',
  headers: {},
  config: requestConfig(),
})

const completion = (content: string | null, finishReason = 'stop') => ({
  model: 'gpt-5-mini-2025-08-07',
  choices: [{ message: { content }, finish_reason: finishReason }],
  usage: {
    prompt_tokens: 6000,
    completion_tokens: 200,
    prompt_tokens_details: { cached_tokens: 5000 },
    completion_tokens_details: { reasoning_tokens: 64 },
  },
})

// An error as axios throws it, carrying the request config with the api-key header
const azureError = (status: number, azureCode?: string) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    requestConfig(),
    {},
    response({ error: { code: azureCode, message: 'Details from Azure' } }, status)
  )

const mockPost = () => vi.spyOn(axios, 'post')

const REQUEST = { conversationId: 'conversation', language: 'fi' as const, messages: MESSAGES }

const ask = () => getAzureCompletion(REQUEST, new AbortController().signal)

const expectNoAnswer = async () => {
  await expect(ask()).rejects.toMatchObject({ status: 502, message: 'No answer from the language model' })
}

describe('getAzureCompletion', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockReturnValue(logger)
    vi.spyOn(logger, 'warn').mockReturnValue(logger)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the reply, model, finish reason and usage', async () => {
    mockPost().mockResolvedValue(response(completion('Open the survey.')))

    await expect(ask()).resolves.toEqual({
      deployment: 'gpt-5-mini',
      model: 'gpt-5-mini-2025-08-07',
      content: 'Open the survey.',
      finishReason: 'stop',
      usage: { promptTokens: 6000, cachedTokens: 5000, completionTokens: 200, reasoningTokens: 64 },
    })
  })

  it('sends the system prompt and the turns to the deployment', async () => {
    const post = mockPost().mockResolvedValue(response(completion('Open the survey.')))
    const { signal } = new AbortController()

    await getAzureCompletion(REQUEST, signal)

    expect(post).toHaveBeenCalledWith(
      'https://test-resource.openai.azure.com/openai/deployments/gpt-5-mini/chat/completions',
      expect.objectContaining({ messages: [{ role: 'system', content: SYSTEM_PROMPTS.fi }, ...MESSAGES] }),
      expect.objectContaining({ params: { 'api-version': '2024-10-21' }, headers: { 'api-key': API_KEY }, signal })
    )
  })

  it('sends the system prompt of the UI language', async () => {
    const post = mockPost().mockResolvedValue(response(completion('Öppna enkäten.')))

    await getAzureCompletion({ ...REQUEST, language: 'sv' }, new AbortController().signal)

    expect(post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ messages: [{ role: 'system', content: SYSTEM_PROMPTS.sv }, ...MESSAGES] }),
      expect.anything()
    )
  })

  it("doesn't send parameters that reasoning models reject", async () => {
    const post = mockPost().mockResolvedValue(response(completion('Open the survey.')))

    await ask()

    const body = post.mock.calls[0][1]
    expect(body).not.toHaveProperty('temperature')
    expect(body).not.toHaveProperty('max_tokens')
    expect(body).toHaveProperty('max_completion_tokens')
  })

  it('returns a reply that was cut off at the token limit, with a warning', async () => {
    mockPost().mockResolvedValue(response(completion('Open the', 'length')))

    await expect(ask()).resolves.toMatchObject({ content: 'Open the', finishReason: 'length' })
    expect(logger.warn).toHaveBeenCalled()
  })

  it.each([
    ['empty', ''],
    ['whitespace only', '  \n'],
    ['missing', null],
  ])('returns an empty reply when it is %s, with an error', async (_, content) => {
    mockPost().mockResolvedValue(response(completion(content, 'length')))

    await expect(ask()).resolves.toMatchObject({
      finishReason: 'length',
      usage: expect.objectContaining({ completionTokens: 200 }),
    })
    expect(logger.error).toHaveBeenCalledWith('[HelpChatbot] Empty reply from Azure', expect.anything())
  })

  it('returns an empty reply when the response has no choices', async () => {
    mockPost().mockResolvedValue(response({}))
    await expect(ask()).resolves.toMatchObject({ model: null, content: '', finishReason: null, usage: null })
  })

  it.each([
    ['a content filter hit', 400, 'content_filter'],
    ['Azure rate limiting', 429, undefined],
    ['a server error', 500, undefined],
  ])('fails on %s and logs the status and code', async (_, status, azureCode) => {
    mockPost().mockRejectedValue(azureError(status, azureCode))

    await expectNoAnswer()
    expect(logger.error).toHaveBeenCalledWith('[HelpChatbot] Azure request failed', {
      message: `Request failed with status code ${status}`,
      code: AxiosError.ERR_BAD_REQUEST,
      status,
      azureCode,
    })
  })

  it('fails on a timeout', async () => {
    mockPost().mockRejectedValue(
      new AxiosError('timeout of 60000ms exceeded', AxiosError.ECONNABORTED, requestConfig())
    )

    await expectNoAnswer()
    expect(logger.error).toHaveBeenCalledWith(
      '[HelpChatbot] Azure request failed',
      expect.objectContaining({ code: AxiosError.ECONNABORTED, status: undefined })
    )
  })

  it('fails on an error that is not from axios', async () => {
    mockPost().mockRejectedValue(new Error('Something broke'))
    await expectNoAnswer()
  })

  it('never logs the api key', async () => {
    mockPost().mockRejectedValue(azureError(401, '401'))

    await expectNoAnswer()
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(API_KEY)
  })

  it('passes a cancellation through as is', async () => {
    const cancellation = new CanceledError()
    mockPost().mockRejectedValue(cancellation)

    await expect(ask()).rejects.toBe(cancellation)
    expect(logger.error).not.toHaveBeenCalled()
  })
})
