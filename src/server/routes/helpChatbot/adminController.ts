import type {
  GetNorppaiConversationResponse,
  GetNorppaiConversationsResponse,
  GetNorppaiFeedbackResponse,
  GetNorppaiMetaResponse,
  GetNorppaiUsageResponse,
} from '@common/types/helpChatbotAdmin'

import { Router, type Response } from 'express'

import type { AuthenticatedRequest } from '../../types'

import { adminAccess } from '../../middleware/adminAccess'
import {
  getConversation,
  getConversations,
  getFeedback,
  getMeta,
  getUsage,
  parseConversationKey,
  parseConversationsQuery,
  parseFeedbackQuery,
  parseReviewedBody,
  parseUsageQuery,
  setReviewed,
} from '../../services/helpChatbotAdmin'

// The NorppAI viewer, mounted under /admin/norppai. Admins only, also once teachers can use the chatbot.

const getMetaHandler = async (_req: AuthenticatedRequest, res: Response<GetNorppaiMetaResponse>) => {
  res.send(await getMeta())
}

const getConversationsHandler = async (req: AuthenticatedRequest, res: Response<GetNorppaiConversationsResponse>) => {
  res.send(await getConversations(parseConversationsQuery(req.query)))
}

const getConversationHandler = async (req: AuthenticatedRequest, res: Response<GetNorppaiConversationResponse>) => {
  const { conversationId, userId } = parseConversationKey(req.query)
  res.send(await getConversation(conversationId, userId))
}

const getFeedbackHandler = async (req: AuthenticatedRequest, res: Response<GetNorppaiFeedbackResponse>) => {
  res.send(await getFeedback(parseFeedbackQuery(req.query)))
}

const putReviewedHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { reviewed } = parseReviewedBody(req.body)
  await setReviewed(req.params.id, reviewed)
  res.sendStatus(204)
}

const getUsageHandler = async (req: AuthenticatedRequest, res: Response<GetNorppaiUsageResponse>) => {
  res.send(await getUsage(parseUsageQuery(req.query)))
}

export const router = Router()

router.use(adminAccess)

router.get('/meta', getMetaHandler)
router.get('/conversations', getConversationsHandler)
router.get('/conversation', getConversationHandler)
router.get('/feedback', getFeedbackHandler)
router.put('/turns/:id/reviewed', putReviewedHandler)
router.get('/usage', getUsageHandler)
