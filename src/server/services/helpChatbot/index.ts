import type { Completion, CompletionRequest } from './completion'

import { ApplicationError } from '../../util/ApplicationError'
import { ANTHROPIC_API_KEY, AZURE_API_KEY, AZURE_RESOURCE, HELP_CHATBOT_MODEL, inProduction } from '../../util/config'
import { getAnthropicCompletion } from './anthropicCompletion'
import { getAzureCompletion } from './azureCompletion'
import { getMockCompletion } from './mockCompletion'
import { fixNorppaSpelling } from './spelling'

export type { Completion } from './completion'
export { noAnswer } from './completion'
export { trimHistory } from './history'
export { parseHelpChatbotFeedback, parseHelpChatbotRequest } from './parseRequest'
export { checkRateLimit } from './rateLimit'
export { createTurn, loadHistory, saveCompletion, saveFeedback, setTurnStatus } from './turns'

// Claude models go to Anthropic, the rest to Azure. Without the credentials for the model, the mock outside
// production, and nothing in production: that's how to cut the chatbot off in an emergency.
const getBackend = (): 'azure' | 'anthropic' | 'mock' | null => {
  const isClaude = HELP_CHATBOT_MODEL.startsWith('claude-')
  if (isClaude && ANTHROPIC_API_KEY) return 'anthropic'
  if (!isClaude && AZURE_API_KEY && AZURE_RESOURCE) return 'azure'
  if (!inProduction) return 'mock'
  return null
}

// Saved with a turn before the call, so a failed turn shows what failed and mock turns can be left out
export const getDeployment = () => {
  const backend = getBackend()
  return backend === 'azure' || backend === 'anthropic' ? HELP_CHATBOT_MODEL : backend
}

const getBackendCompletion = (request: CompletionRequest, signal: AbortSignal): Promise<Completion> => {
  const backend = getBackend()
  if (backend === 'azure') return getAzureCompletion(request, signal)
  if (backend === 'anthropic') return getAnthropicCompletion(request, signal)
  if (backend === 'mock') return getMockCompletion(request, signal)
  throw new ApplicationError('The help chatbot is not configured', 503)
}

export const getCompletion = async (request: CompletionRequest, signal: AbortSignal): Promise<Completion> => {
  const completion = await getBackendCompletion(request, signal)
  return { ...completion, content: fixNorppaSpelling(completion.content) }
}
