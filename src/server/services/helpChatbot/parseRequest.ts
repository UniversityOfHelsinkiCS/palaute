import type { LanguageId } from '@common/types/common'
import type { HelpChatbotTurn } from '@common/types/helpChatbot'

import z from 'zod/v4'

import { MAX_QUESTION_LENGTH, trimHistory } from '../../../common/helpChatbot'
import { ApplicationError } from '../../util/ApplicationError'

// The client sends the whole history, so a user can forge assistant turns. That only affects their own chat:
// the model has no tools or data, the system prompt isn't secret and the budget and rate limits cap the cost.
// If that changes, sign the replies (an HMAC over user, conversation and content) and verify them here.
const TurnSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('user'), content: z.string().min(1).max(MAX_QUESTION_LENGTH) }),
  // Bounded by the history budget
  z.object({ role: z.literal('assistant'), content: z.string().min(1) }),
])

const BodySchema = z.object({
  conversationId: z.string().min(1).max(100),
  language: z.enum(['fi', 'sv', 'en']),
  // Trimmed to the history budget, so a long conversation keeps working. Assistant turns have no length limit
  // of their own for the same reason. The request body size limit bounds the untrimmed history.
  messages: z
    .array(TurnSchema)
    .min(1)
    .refine(messages => messages.at(-1)?.role === 'user', 'The last message must be from the user')
    .transform(trimHistory),
})

export type HelpChatbotRequest = {
  conversationId: string
  language: LanguageId
  turns: HelpChatbotTurn[]
}

export const parseHelpChatbotRequest = (body: unknown): HelpChatbotRequest => {
  const result = BodySchema.safeParse(body)
  if (!result.success) throw ApplicationError.BadRequest(z.prettifyError(result.error))

  const { conversationId, language, messages } = result.data
  return { conversationId, language, turns: messages }
}
