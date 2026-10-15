import { Alert, Box, Checkbox, FormControlLabel, Paper, Typography } from '@mui/material'
import { isAxiosError } from 'axios'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'

import type { ConversationKey } from './api'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'
import { useHelpChatbotConversation } from './api'
import { formatDateTime, formatEuros, formatNumber, shortSha } from './format'
import { describeMetadata, formatEntries, metadataChanges } from './metadata'
import TurnItem from './TurnItem'
import { conversationToMarkdown } from './turnText'

const unique = <T,>(values: T[]) => [...new Set(values)]

type ConversationDetailProps = {
  conversationKey: ConversationKey
  highlightedTurnId: string | null
}

const ConversationDetail = ({ conversationKey, highlightedTurnId }: ConversationDetailProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { data: conversation, isLoading, error } = useHelpChatbotConversation(conversationKey)
  const [showOutsideHistory, setShowOutsideHistory] = useState(true)
  const highlightedRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!conversation || !highlightedRef.current) return
    highlightedRef.current.scrollIntoView({ block: 'start' })
    highlightedRef.current.focus({ preventScroll: true })
  }, [conversation, highlightedTurnId])

  if (isLoading) return <LoadingProgress />
  if (isAxiosError(error) && error.response?.status === 404)
    return <Alert severity="warning">This conversation wasn&apos;t found.</Alert>
  if (error || !conversation) return <Alert severity="error">The conversation couldn&apos;t be loaded.</Alert>

  const { turns } = conversation
  const first = turns[0]
  const shown = turns.filter(turn => showOutsideHistory || turn.inHistory || turn.id === highlightedTurnId)
  const tokens = turns.reduce((sum, turn) => sum + (turn.promptTokens ?? 0) + (turn.completionTokens ?? 0), 0)
  const cost = turns.reduce((sum, turn) => sum + (turn.cost ?? 0), 0)
  const versions = unique(turns.map(turn => shortSha(turn.gitSha)))
  const models = unique(turns.flatMap(turn => (turn.model ? [turn.model] : [])))
  // The first turn's metadata is the conversation's; a turn shows only what differs from it
  const firstMetadata = describeMetadata(first.metadata, first.impersonatedUsername)

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      enqueueSnackbar(`${what} copied`, { variant: 'success' })
    } catch {
      enqueueSnackbar(`The ${what.toLowerCase()} couldn't be copied`, { variant: 'error' })
    }
  }

  return (
    <Paper variant="outlined" component="section" aria-labelledby="help-chatbot-conversation-title">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1.5, p: '14px 16px' }}>
        <Box>
          <Typography id="help-chatbot-conversation-title" component="h2" sx={{ fontSize: 17, fontWeight: 700 }}>
            {formatDateTime(first.createdAt)} · {conversation.username ?? 'unknown user'}
          </Typography>
          {firstMetadata.length > 0 && <Typography variant="body2">{formatEntries(firstMetadata)}</Typography>}
          <Typography variant="body2" color="text.secondary">
            {turns.length} questions · version {versions.join(', ')} · {models.join(', ') || 'no model'} ·{' '}
            {formatNumber(tokens)} tokens · {formatEuros(cost)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showOutsideHistory}
                onChange={event => setShowOutsideHistory(event.target.checked)}
              />
            }
            label="Show turns not in the history"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
          />
          <NorButton
            color="secondary"
            size="small"
            onClick={() =>
              copy(conversationToMarkdown(conversation, { includeOutsideHistory: showOutsideHistory }), 'Markdown')
            }
          >
            Copy as Markdown
          </NorButton>
          <NorButton color="secondary" size="small" onClick={() => copy(window.location.href, 'Link')}>
            Copy link
          </NorButton>
        </Box>
      </Box>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: '0 16px 4px' }}>
        {shown.map(turn => (
          <TurnItem
            key={turn.id}
            ref={turn.id === highlightedTurnId ? highlightedRef : undefined}
            turn={turn}
            highlighted={turn.id === highlightedTurnId}
            metadataChanges={metadataChanges(describeMetadata(turn.metadata, turn.impersonatedUsername), firstMetadata)}
          />
        ))}
      </Box>
    </Paper>
  )
}

export default ConversationDetail
