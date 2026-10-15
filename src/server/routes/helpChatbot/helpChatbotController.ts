import type { LanguageId } from '@common/types/common'
import type { HelpChatbotTurnMetadata, PostHelpChatbotTurnResponse } from '@common/types/helpChatbot'

import * as Sentry from '@sentry/node'
import { Router, type Response } from 'express'

import type { Completion } from '../../services/helpChatbot'
import type { AuthenticatedRequest } from '../../types'

import { adminAccess } from '../../middleware/adminAccess'
import {
  checkRateLimit,
  createTurn,
  getCompletion,
  getDeployment,
  loadHistory,
  noAnswer,
  parseHelpChatbotFeedback,
  parseHelpChatbotRequest,
  saveCompletion,
  saveFeedback,
  setTurnStatus,
  trimHistory,
} from '../../services/helpChatbot'
import { logger } from '../../util/logger'

// The admin behind a "login as" asks, so impersonating doesn't get around the limits
const getUserId = (req: AuthenticatedRequest) => req.user.mockedBy?.id ?? req.user.id

// Context saved with the turn for the admin viewer
const getMetadata = (req: AuthenticatedRequest, uiLanguage: LanguageId): HelpChatbotTurnMetadata => ({
  uiLanguage,
  ...(req.user.mockedBy && { impersonatedUserId: req.user.id }),
})

// The conversation is saved in help_chatbot_turns; only metadata is logged
const postTurn = async (req: AuthenticatedRequest, res: Response<PostHelpChatbotTurnResponse>) => {
  const { conversationId, previousTurnId, language, question } = parseHelpChatbotRequest(req.body)
  const userId = getUserId(req)

  // Stop the model when the client goes away, e.g. on New conversation. Listening before the rate limit
  // check means a client that leaves during it gets an already aborted signal, which fails immediately.
  const abortController = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) abortController.abort()
  })

  await checkRateLimit(userId)

  const history = await loadHistory(userId, conversationId, previousTurnId)
  const messages = trimHistory([...history, { role: 'user', content: question }])
  // If saving fails, the model isn't called: an answer that can't be saved can't be part of the history
  const turn = await createTurn({
    userId,
    metadata: getMetadata(req, language),
    deployment: getDeployment(),
    conversationId,
    previousTurnId,
    question,
  })

  const startedAt = Date.now()
  let completion: Completion
  try {
    completion = await getCompletion({ conversationId, language, messages }, abortController.signal)
  } catch (error) {
    const aborted = abortController.signal.aborted
    // Reported on its own, so a database failure here doesn't replace the model's error
    try {
      await setTurnStatus(turn, aborted ? 'aborted' : 'failed')
    } catch (statusError) {
      logger.error('[HelpChatbot] Turn status not saved', { turnId: turn.id })
      Sentry.captureException(statusError)
    }
    if (!aborted) throw error
    logger.info('[HelpChatbot] Request aborted by the client', { userId, conversationId, turnId: turn.id })
    return
  }
  const durationMs = Date.now() - startedAt

  const status = await saveCompletion(turn, completion, durationMs)

  const { deployment, model, finishReason, usage } = completion
  logger.info('[HelpChatbot] Reply', {
    userId,
    conversationId,
    turnId: turn.id,
    status,
    deployment,
    model,
    finishReason,
    durationMs,
    ...usage,
  })

  if (status === 'empty') throw noAnswer()
  res.send({ id: turn.id, answer: completion.content })
}

const putFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const feedback = parseHelpChatbotFeedback(req.body)
  const userId = getUserId(req)

  await saveFeedback(req.params.id, userId, feedback)

  logger.info('[HelpChatbot] Feedback', { userId, turnId: req.params.id, rating: feedback.rating })
  res.sendStatus(204)
}

export const router = Router()

// The single access check; teachers get access later
router.use(adminAccess)

router.post('/turns', postTurn)
router.put('/turns/:id/feedback', putFeedback)
