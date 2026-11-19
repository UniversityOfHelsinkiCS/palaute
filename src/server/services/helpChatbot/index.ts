import type { Completion, CompletionRequest } from './completion'

import { ApplicationError } from '../../util/ApplicationError'
import { ANTHROPIC_API_KEY, inProduction } from '../../util/config'
import { getAnthropicCompletion, MODEL } from './anthropicCompletion'
import { getMockCompletion } from './mockCompletion'
import { fixNorppaSpelling } from './spelling'

export type { Completion } from './completion'
export { noAnswer } from './completion'
export { trimHistory } from './history'
export { parseHelpChatbotFeedback, parseHelpChatbotRequest } from './parseRequest'
export { checkRateLimit } from './rateLimit'
export { createTurn, loadHistory, saveCompletion, saveFeedback, setTurnStatus } from './turns'

// Without ANTHROPIC_API_KEY, the mock outside production, and nothing in production: that's how to cut the chatbot
// off in an emergency
const getBackend = (): 'anthropic' | 'mock' | null => {
  if (ANTHROPIC_API_KEY) return 'anthropic'
  if (!inProduction) return 'mock'
  return null
}

// Saved with a turn before the call, so a failed turn shows what failed and mock turns can be left out
export const getDeployment = () => {
  const backend = getBackend()
  return backend === 'anthropic' ? MODEL : backend
}

const getBackendCompletion = (request: CompletionRequest, signal: AbortSignal): Promise<Completion> => {
  const backend = getBackend()
  if (backend === 'anthropic') return getAnthropicCompletion(request, signal)
  if (backend === 'mock') return getMockCompletion(request, signal)
  throw new ApplicationError('The help chatbot is not configured', 503)
}

export const getCompletion = async (request: CompletionRequest, signal: AbortSignal): Promise<Completion> => {
  const completion = await getBackendCompletion(request, signal)
  return { ...completion, content: fixNorppaSpelling(completion.content) }
}
