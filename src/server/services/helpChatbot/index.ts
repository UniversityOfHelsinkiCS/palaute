import type { Completion, CompletionRequest } from './azureCompletion'

import { ApplicationError } from '../../util/ApplicationError'
import { AZURE_API_KEY, AZURE_RESOURCE, HELP_CHATBOT_MODEL, inProduction } from '../../util/config'
import { getAzureCompletion } from './azureCompletion'
import { getMockCompletion } from './mockCompletion'

export type { Completion } from './azureCompletion'
export { noAnswer } from './azureCompletion'
export { trimHistory } from './history'
export { parseHelpChatbotFeedback, parseHelpChatbotRequest } from './parseRequest'
export { checkRateLimit } from './rateLimit'
export { createTurn, loadHistory, saveCompletion, saveFeedback, setTurnStatus } from './turns'

// Without Azure credentials, development and tests use the mock. In production (and staging) the chatbot
// is then unavailable, which is also how to cut it off in an emergency.
const getBackend = (): 'azure' | 'mock' | null => {
  if (AZURE_API_KEY && AZURE_RESOURCE) return 'azure'
  if (!inProduction) return 'mock'
  return null
}

// What getCompletion calls: the Azure deployment, 'mock', or null when the chatbot isn't configured.
// Saved with a turn before the call, so a failed turn shows what failed and mock turns can be left out.
export const getDeployment = () => {
  const backend = getBackend()
  return backend === 'azure' ? HELP_CHATBOT_MODEL : backend
}

export const getCompletion = async (request: CompletionRequest, signal: AbortSignal): Promise<Completion> => {
  const backend = getBackend()
  if (backend === 'azure') return getAzureCompletion(request, signal)
  if (backend === 'mock') return getMockCompletion(request, signal)
  throw new ApplicationError('The help chatbot is not configured', 503)
}
