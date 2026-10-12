import type { GetNorppaiConversationResponse, NorppaiTurn } from '@common/types/helpChatbotAdmin'

import { formatDateTime, formatDuration, formatEuros, formatNumber, formatTime, shortSha } from './format'
import { describeMetadata, formatEntries, metadataChanges } from './metadata'

// Texts describing a turn, shared by the conversation view and its Markdown export

// Why a turn isn't part of the conversation the user saw, or null if it is
export const describeOutsideHistory = (turn: NorppaiTurn): string | null => {
  if (turn.inHistory) return null
  switch (turn.status) {
    case 'failed':
      return 'Failed: the request to the model failed. The user saw "No answer received".'
    case 'aborted':
      return 'Aborted: the user left, e.g. started a new conversation, before the answer arrived.'
    case 'pending':
      return 'No answer was saved: the server may have stopped during the request.'
    case 'empty':
      if (turn.finishReason === 'length')
        return 'No answer: the reasoning used the whole token limit. The user saw "No answer received".'
      if (turn.finishReason === 'content_filter')
        return 'No answer: the content filter stopped it. The user saw "No answer received".'
      return 'No answer: the model returned nothing. The user saw "No answer received".'
    default:
      return "Not in the history: the next question didn't follow this answer, so it may never have reached the user."
  }
}

export const describeTokens = (turn: NorppaiTurn) => {
  if (turn.promptTokens === null) return null
  return `${formatNumber(turn.promptTokens)} in (${formatNumber(turn.cachedTokens ?? 0)} cached) · ${formatNumber(
    turn.completionTokens ?? 0
  )} out (${formatNumber(turn.reasoningTokens ?? 0)} reasoning)`
}

const describeRating = (turn: NorppaiTurn) => {
  if (turn.rating === null) return null
  const rating = turn.rating === 'up' ? 'Helpful' : 'Not helpful'
  return turn.feedbackComment ? `${rating}: "${turn.feedbackComment}"` : rating
}

const quote = (text: string) =>
  text
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n')

// For pasting a conversation into a review. Turns outside the history are included only if asked for.
export const conversationToMarkdown = (
  conversation: GetNorppaiConversationResponse,
  { includeOutsideHistory }: { includeOutsideHistory: boolean }
) => {
  const turns = conversation.turns.filter(turn => includeOutsideHistory || turn.inHistory)
  const first = conversation.turns[0]
  const firstMetadata = describeMetadata(first.metadata, first.impersonatedUsername)
  const header = [
    `# NorppAI conversation, ${formatDateTime(first.createdAt)}`,
    '',
    `- User: ${conversation.username ?? 'unknown'}`,
    ...firstMetadata.map(({ label, value }) => `- ${label}: ${value}`),
    `- Version: ${[...new Set(conversation.turns.map(turn => shortSha(turn.gitSha)))].join(', ')}`,
  ]

  const sections = turns.map(turn => {
    const meta = [
      turn.status,
      turn.finishReason,
      turn.durationMs === null ? null : formatDuration(turn.durationMs),
      describeTokens(turn),
      turn.cost === null ? null : formatEuros(turn.cost),
    ].filter(Boolean)
    const followsNote =
      turn.followsNumber !== null && turn.followsNumber !== turn.number - 1 ? `Follows #${turn.followsNumber}.` : null
    const retryNote = turn.retriedAsNumber === null ? null : `Asked again as #${turn.retriedAsNumber}.`
    const changes = metadataChanges(describeMetadata(turn.metadata, turn.impersonatedUsername), firstMetadata)
    const metadataNote = changes.length > 0 ? `${formatEntries(changes)}.` : null
    const lines = [
      `## #${turn.number}, ${formatTime(turn.createdAt)}`,
      '',
      `_${meta.join(' · ')}_`,
      ...[describeOutsideHistory(turn), followsNote, retryNote, metadataNote]
        .filter(Boolean)
        .map(note => `\n_${note}_`),
      '',
      '**Question:**',
      '',
      quote(turn.question ?? '(cleared)'),
    ]
    if (turn.answer !== null) lines.push('', '**Answer:**', '', quote(turn.answer))
    const rating = describeRating(turn)
    if (rating) lines.push('', `**Feedback:** ${rating}`)
    return lines.join('\n')
  })

  return [...header, '', ...sections.flatMap(section => [section, ''])].join('\n')
}
