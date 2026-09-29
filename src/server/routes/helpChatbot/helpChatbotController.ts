import type { PostHelpChatbotMessageResponse } from '@common/types/helpChatbot'

import { randomUUID } from 'crypto'
import { Router, type Response } from 'express'

import type { Completion } from '../../services/helpChatbot'
import type { AuthenticatedRequest } from '../../types'

import { adminAccess } from '../../middleware/adminAccess'
import { checkRateLimit, getCompletion, parseHelpChatbotRequest } from '../../services/helpChatbot'
import { logger } from '../../util/logger'

// Only metadata is logged, never what the user asked
const postMessage = async (req: AuthenticatedRequest, res: Response<PostHelpChatbotMessageResponse>) => {
  const request = parseHelpChatbotRequest(req.body)
  const { conversationId } = request
  // The admin behind a "login as", so impersonating doesn't get around the limits
  const userId = req.user.mockedBy?.id ?? req.user.id

  // Stop the model when the client goes away, e.g. on New conversation. Listening before the rate limit
  // check means a client that leaves during it gets an already aborted signal, which fails immediately.
  const abortController = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) abortController.abort()
  })

  await checkRateLimit(userId)

  const startedAt = Date.now()
  let completion: Completion
  try {
    completion = await getCompletion(request, abortController.signal)
  } catch (error) {
    if (!abortController.signal.aborted) throw error
    logger.info('[HelpChatbot] Request aborted by the client', { userId, conversationId })
    return
  }

  const { model, content, finishReason, usage } = completion
  logger.info('[HelpChatbot] Reply', {
    userId,
    conversationId,
    model,
    finishReason,
    durationMs: Date.now() - startedAt,
    ...usage,
  })

  res.send({ message: { id: randomUUID(), role: 'assistant', content } })
}

export const router = Router()

// The single access check; teachers get access later
router.use(adminAccess)

router.post('/messages', postMessage)
