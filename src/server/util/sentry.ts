import * as Sentry from '@sentry/node'

import { inProduction, inE2EMode, GIT_SHA, SENTRY_DSN } from './config'

// Questions to the help chatbot are never stored, so keep request bodies from its routes out of Sentry.
// Lowercased because Express matches routes case-insensitively
const dropHelpChatbotRequestBody = <T extends Sentry.Event>(event: T): T => {
  if (event.request?.url?.toLowerCase().includes('/help-chatbot/')) delete event.request.data
  return event
}

export const initializeSentry = () => {
  if (!inProduction || inE2EMode) return

  Sentry.init({
    dsn: SENTRY_DSN,
    release: GIT_SHA,
    integrations: [Sentry.httpIntegration({ breadcrumbs: true }), Sentry.expressIntegration()],
    tracesSampleRate: 1.0,
    ignoreErrors: ['No access', 'jwt expired', 'Not found'],
    beforeSend: dropHelpChatbotRequestBody,
    beforeSendTransaction: dropHelpChatbotRequestBody,
  })
}
