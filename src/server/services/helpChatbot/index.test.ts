import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAnthropicCompletion } from './anthropicCompletion'
import { getCompletion, getDeployment } from './index'
import { getMockCompletion } from './mockCompletion'

const config = vi.hoisted(() => ({
  ANTHROPIC_API_KEY: 'test-api-key' as string | undefined,
  inProduction: false,
}))

vi.mock('../../util/config', async importOriginal => ({
  ...(await importOriginal<typeof import('../../util/config')>()),
  get ANTHROPIC_API_KEY() {
    return config.ANTHROPIC_API_KEY
  },
  get inProduction() {
    return config.inProduction
  },
}))

vi.mock('./anthropicCompletion', () => ({ getAnthropicCompletion: vi.fn(), MODEL: 'claude-haiku-5-5' }))
vi.mock('./mockCompletion', () => ({ getMockCompletion: vi.fn() }))
vi.mock('./turns', () => ({}))
vi.mock('./rateLimit', () => ({}))

const REQUEST = {
  conversationId: 'conversation',
  language: 'fi' as const,
  messages: [{ role: 'user' as const, content: 'Missä näen vastaukset?' }],
}

const completion = (content: string) => ({
  deployment: 'claude-haiku-5-5',
  model: 'claude-haiku-5-5',
  content,
  finishReason: 'stop',
  usage: null,
})

const ask = () => getCompletion(REQUEST, new AbortController().signal)

describe('the help chatbot backend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.ANTHROPIC_API_KEY = 'test-api-key'
    config.inProduction = false
  })

  it('answers through Anthropic with the key', async () => {
    vi.mocked(getAnthropicCompletion).mockResolvedValue(completion('Vastaukset-välilehdellä.'))

    expect(getDeployment()).toBe('claude-haiku-5-5')
    expect((await ask()).content).toBe('Vastaukset-välilehdellä.')
    expect(getMockCompletion).not.toHaveBeenCalled()
  })

  it('fixes how the answer inflects Norppa', async () => {
    vi.mocked(getAnthropicCompletion).mockResolvedValue(completion('Norppassa näet vastaukset.'))

    expect((await ask()).content).toBe('Norpassa näet vastaukset.')
  })

  it('answers with the mock without the key outside production', async () => {
    config.ANTHROPIC_API_KEY = undefined
    vi.mocked(getMockCompletion).mockResolvedValue(completion('Mock answer'))

    expect(getDeployment()).toBe('mock')
    expect((await ask()).content).toBe('Mock answer')
    expect(getAnthropicCompletion).not.toHaveBeenCalled()
  })

  it('is off without the key in production', async () => {
    config.ANTHROPIC_API_KEY = undefined
    config.inProduction = true

    expect(getDeployment()).toBeNull()
    await expect(ask()).rejects.toMatchObject({ status: 503 })
  })
})
