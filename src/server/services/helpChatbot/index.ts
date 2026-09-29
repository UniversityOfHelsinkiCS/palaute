import type { Completion } from './azureCompletion'
import type { HelpChatbotRequest } from './parseRequest'

import { ApplicationError } from '../../util/ApplicationError'
import { AZURE_API_KEY, AZURE_RESOURCE, inProduction } from '../../util/config'
import { getAzureCompletion } from './azureCompletion'
import { getMockCompletion } from './mockCompletion'

export type { Completion } from './azureCompletion'
export { parseHelpChatbotRequest } from './parseRequest'
export { checkRateLimit } from './rateLimit'

// Without Azure credentials, development and tests use the mock. In production (and staging) the chatbot
// is then unavailable, which is also how to cut it off in an emergency.
export const getCompletion = async (request: HelpChatbotRequest, signal: AbortSignal): Promise<Completion> => {
  if (AZURE_API_KEY && AZURE_RESOURCE) return getAzureCompletion(request.turns, signal)
  if (!inProduction) return getMockCompletion(request, signal)
  throw new ApplicationError('The help chatbot is not configured', 503)
}
