import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import type { ChatEntry, Feedback, Rating, UserEntry } from './types'

import { askQuestion, isCancelled, sendFeedback } from './api'

type Conversation = { id: string; entries: ChatEntry[] }

type RequestVariables = {
  conversationId: string
  previousAnswerId: string | null
  question: string
  userEntryId: string
  signal: AbortSignal
}

// rate and sendComment reject if saving fails, leaving the feedback as it was
export type FeedbackActions = {
  rate: (answerId: string, rating: Rating | null) => Promise<void>
  setCommentDraft: (answerId: string, draft: string) => void
  sendComment: (answerId: string, comment: string) => Promise<void>
  skipComment: (answerId: string) => void
}

const NO_FEEDBACK: Feedback = { rating: null, comment: null, commentDraft: '' }

const createConversation = (): Conversation => ({ id: crypto.randomUUID(), entries: [] })

const setUserStatus = (entries: ChatEntry[], id: string, status: UserEntry['status']): ChatEntry[] =>
  entries.map(entry => (entry.role === 'user' && entry.id === id ? { ...entry, status } : entry))

const updateFeedback = (entries: ChatEntry[], id: string, update: (feedback: Feedback) => Feedback): ChatEntry[] =>
  entries.map(entry =>
    entry.role === 'assistant' && entry.id === id ? { ...entry, feedback: update(entry.feedback) } : entry
  )

// Failed questions after the latest answer aren't part of the history
const getPreviousAnswerId = (entries: ChatEntry[]) => entries.findLast(entry => entry.role === 'assistant')?.id ?? null

const useConversation = () => {
  const [conversation, setConversation] = useState(createConversation)
  const abortController = useRef<AbortController | null>(null)

  // An answer to an earlier conversation is dropped
  const updateIfCurrent = (conversationId: string, update: (entries: ChatEntry[]) => ChatEntry[]) =>
    setConversation(current =>
      current.id === conversationId ? { ...current, entries: update(current.entries) } : current
    )

  const mutation = useMutation({
    mutationFn: ({ conversationId, previousAnswerId, question, signal }: RequestVariables) =>
      askQuestion(conversationId, previousAnswerId, question, signal),
    onSuccess: (answer, { conversationId, userEntryId }) =>
      updateIfCurrent(conversationId, entries => [
        ...setUserStatus(entries, userEntryId, 'answered'),
        { id: answer.id, role: 'assistant', markdown: answer.markdown, feedback: NO_FEEDBACK },
      ]),
    onError: (error, { conversationId, userEntryId }) => {
      if (isCancelled(error)) return
      updateIfCurrent(conversationId, entries => setUserStatus(entries, userEntryId, 'failed'))
    },
  })

  const pending = conversation.entries.some(entry => entry.role === 'user' && entry.status === 'waiting')

  const last = conversation.entries.at(-1)
  const retryableId = last?.role === 'user' && last.status === 'failed' ? last.id : null

  const request = (entries: ChatEntry[], userEntry: UserEntry) => {
    setConversation({ ...conversation, entries })
    abortController.current = new AbortController()
    mutation.mutate({
      conversationId: conversation.id,
      previousAnswerId: getPreviousAnswerId(entries),
      question: userEntry.text,
      userEntryId: userEntry.id,
      signal: abortController.current.signal,
    })
  }

  const send = (text: string) => {
    if (pending) return
    const userEntry: UserEntry = { id: crypto.randomUUID(), role: 'user', text, status: 'waiting' }
    request([...conversation.entries, userEntry], userEntry)
  }

  const retry = () => {
    if (pending || last?.role !== 'user' || last.id !== retryableId) return
    request(setUserStatus(conversation.entries, retryableId, 'waiting'), last)
  }

  const startNew = () => {
    abortController.current?.abort()
    setConversation(createConversation())
  }

  const setFeedback = (conversationId: string, answerId: string, update: (feedback: Feedback) => Feedback) =>
    updateIfCurrent(conversationId, entries => updateFeedback(entries, answerId, update))

  const feedback: FeedbackActions = {
    rate: async (answerId, rating) => {
      const conversationId = conversation.id
      await sendFeedback(answerId, rating)
      setFeedback(conversationId, answerId, () => ({
        rating,
        comment: rating === 'down' ? 'asking' : null,
        commentDraft: '',
      }))
    },
    setCommentDraft: (answerId, draft) =>
      setFeedback(conversation.id, answerId, current => ({ ...current, commentDraft: draft })),
    sendComment: async (answerId, comment) => {
      const conversationId = conversation.id
      await sendFeedback(answerId, 'down', comment)
      setFeedback(conversationId, answerId, current => ({ ...current, comment: 'sent', commentDraft: '' }))
    },
    skipComment: answerId =>
      setFeedback(conversation.id, answerId, current => ({ ...current, comment: null, commentDraft: '' })),
  }

  return { entries: conversation.entries, pending, retryableId, send, retry, startNew, feedback }
}

export default useConversation
