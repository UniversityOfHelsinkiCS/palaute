import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import type { ChatEntry, UserEntry } from './types'

import { askNorppai, isCancelled } from './helpChatbotService'

type Conversation = { id: string; entries: ChatEntry[] }

type RequestVariables = {
  conversationId: string
  entries: ChatEntry[]
  userEntryId: string
  signal: AbortSignal
}

const createConversation = (): Conversation => ({ id: crypto.randomUUID(), entries: [] })

const setUserStatus = (entries: ChatEntry[], id: string, status: UserEntry['status']): ChatEntry[] =>
  entries.map(entry => (entry.role === 'user' && entry.id === id ? { ...entry, status } : entry))

const useConversation = () => {
  const [conversation, setConversation] = useState(createConversation)
  const abortController = useRef<AbortController | null>(null)

  // A reply to an earlier conversation is dropped
  const updateIfCurrent = (conversationId: string, update: (entries: ChatEntry[]) => ChatEntry[]) =>
    setConversation(current =>
      current.id === conversationId ? { ...current, entries: update(current.entries) } : current
    )

  const mutation = useMutation({
    mutationFn: ({ conversationId, entries, signal }: RequestVariables) => askNorppai(conversationId, entries, signal),
    onSuccess: (reply, { conversationId, userEntryId }) =>
      updateIfCurrent(conversationId, entries => [
        ...setUserStatus(entries, userEntryId, 'answered'),
        { id: reply.id, role: 'assistant', markdown: reply.markdown },
      ]),
    onError: (error, { conversationId, userEntryId }) => {
      if (isCancelled(error)) return
      updateIfCurrent(conversationId, entries => setUserStatus(entries, userEntryId, 'failed'))
    },
  })

  const pending = conversation.entries.some(entry => entry.role === 'user' && entry.status === 'waiting')

  // Only the latest question can be retried, and only if nothing has been asked after it
  const last = conversation.entries.at(-1)
  const retryableId = last?.role === 'user' && last.status === 'failed' ? last.id : null

  const request = (entries: ChatEntry[], userEntryId: string) => {
    setConversation({ ...conversation, entries })
    abortController.current = new AbortController()
    mutation.mutate({ conversationId: conversation.id, entries, userEntryId, signal: abortController.current.signal })
  }

  const send = (text: string) => {
    if (pending) return
    const userEntry: UserEntry = { id: crypto.randomUUID(), role: 'user', text, status: 'waiting' }
    request([...conversation.entries, userEntry], userEntry.id)
  }

  const retry = () => {
    if (pending || !retryableId) return
    request(setUserStatus(conversation.entries, retryableId, 'waiting'), retryableId)
  }

  const startNew = () => {
    abortController.current?.abort()
    setConversation(createConversation())
  }

  return { entries: conversation.entries, pending, retryableId, send, retry, startNew }
}

export default useConversation
