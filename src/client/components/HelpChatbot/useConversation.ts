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

  const send = (text: string) => {
    if (pending) return
    const userEntry: UserEntry = { id: crypto.randomUUID(), role: 'user', text, status: 'waiting' }
    const entries = [...conversation.entries, userEntry]
    setConversation({ ...conversation, entries })

    abortController.current = new AbortController()
    mutation.mutate({
      conversationId: conversation.id,
      entries,
      userEntryId: userEntry.id,
      signal: abortController.current.signal,
    })
  }

  const startNew = () => {
    abortController.current?.abort()
    setConversation(createConversation())
  }

  return { entries: conversation.entries, pending, send, startNew }
}

export default useConversation
