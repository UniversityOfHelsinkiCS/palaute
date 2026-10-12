import { describe, expect, it } from 'vitest'

import { MAX_FEEDBACK_COMMENT_LENGTH, MAX_QUESTION_LENGTH } from '../../../common/helpChatbot'
import { parseHelpChatbotFeedback, parseHelpChatbotRequest } from './parseRequest'

const TURN_ID = '6f1c1a52-8d3e-4c55-9a0e-2b7f4d9c1e3a'

const BODY = { conversationId: 'conversation', previousTurnId: TURN_ID, language: 'fi', question: 'And then?' }

const parse = (overrides: Record<string, unknown>) => parseHelpChatbotRequest({ ...BODY, ...overrides })

const expectBadRequest = (run: () => unknown) => expect(run).toThrow(expect.objectContaining({ status: 400 }))

describe('parseHelpChatbotRequest', () => {
  it('returns the question and where it continues the conversation', () => {
    expect(parseHelpChatbotRequest(BODY)).toEqual(BODY)
  })

  it('accepts the first question of a conversation', () => {
    expect(parse({ previousTurnId: null }).previousTurnId).toBeNull()
  })

  it('accepts a question of the maximum length', () => {
    expect(parse({ question: 'a'.repeat(MAX_QUESTION_LENGTH) }).question).toHaveLength(MAX_QUESTION_LENGTH)
  })

  it('rejects a question over the maximum length', () => {
    expectBadRequest(() => parse({ question: 'a'.repeat(MAX_QUESTION_LENGTH + 1) }))
  })

  it('rejects an empty question', () => {
    expectBadRequest(() => parse({ question: '' }))
  })

  it('rejects a previous turn id that is not a uuid', () => {
    expectBadRequest(() => parse({ previousTurnId: 'turn' }))
  })

  it('rejects a missing previous turn id', () => {
    expectBadRequest(() => parse({ previousTurnId: undefined }))
  })

  it('rejects an unknown UI language', () => {
    expectBadRequest(() => parse({ language: 'de' }))
    expectBadRequest(() => parse({ language: undefined }))
  })

  it('rejects a malformed body', () => {
    expectBadRequest(() => parseHelpChatbotRequest('Hi'))
    expectBadRequest(() => parse({ conversationId: undefined }))
    expectBadRequest(() => parse({ conversationId: 'x'.repeat(101) }))
    expectBadRequest(() => parseHelpChatbotRequest(null))
  })
})

describe('parseHelpChatbotFeedback', () => {
  it('accepts a rating without a comment', () => {
    expect(parseHelpChatbotFeedback({ rating: 'up' })).toEqual({ rating: 'up', comment: null })
    expect(parseHelpChatbotFeedback({ rating: 'down' })).toEqual({ rating: 'down', comment: null })
  })

  it('accepts removing the rating', () => {
    expect(parseHelpChatbotFeedback({ rating: null })).toEqual({ rating: null, comment: null })
  })

  it('accepts a trimmed comment on a thumbs down', () => {
    expect(parseHelpChatbotFeedback({ rating: 'down', comment: ' Wrong tab \n' })).toEqual({
      rating: 'down',
      comment: 'Wrong tab',
    })
  })

  it('rejects a comment on anything but a thumbs down', () => {
    expectBadRequest(() => parseHelpChatbotFeedback({ rating: 'up', comment: 'Great' }))
    expectBadRequest(() => parseHelpChatbotFeedback({ rating: null, comment: 'Never mind' }))
  })

  it('rejects an empty comment', () => {
    expectBadRequest(() => parseHelpChatbotFeedback({ rating: 'down', comment: '  ' }))
  })

  it('accepts a comment of the maximum length and rejects a longer one', () => {
    const comment = 'a'.repeat(MAX_FEEDBACK_COMMENT_LENGTH)
    expect(parseHelpChatbotFeedback({ rating: 'down', comment }).comment).toBe(comment)
    expectBadRequest(() => parseHelpChatbotFeedback({ rating: 'down', comment: `${comment}a` }))
  })

  it('rejects an unknown or missing rating', () => {
    expectBadRequest(() => parseHelpChatbotFeedback({ rating: 'meh' }))
    expectBadRequest(() => parseHelpChatbotFeedback({}))
    expectBadRequest(() => parseHelpChatbotFeedback(null))
  })
})
