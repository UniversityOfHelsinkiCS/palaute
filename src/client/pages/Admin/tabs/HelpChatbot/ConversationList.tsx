import type { GetHelpChatbotConversationsQuery, HelpChatbotConversationSummary } from '@common/types/helpChatbotAdmin'

import { ThumbDownOutlined, ThumbUpOutlined } from '@mui/icons-material'
import { Alert, Box, List, ListItem, ListItemButton, Paper, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'

import type { ConversationKey } from './api'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'
import { useHelpChatbotConversations } from './api'
import { formatDateTime, formatEuros, formatNumber } from './format'
import { getUiLanguage } from './metadata'

const describeProblems = ({ failed, empty, aborted, cutOff }: HelpChatbotConversationSummary) => {
  const problems: [number, string][] = [
    [failed, 'failed'],
    [empty, 'empty'],
    [aborted, 'aborted'],
    [cutOff, 'cut off'],
  ]
  return problems
    .filter(([count]) => count > 0)
    .map(([count, label]) => `${count} ${label}`)
    .join(' · ')
}

const isSelected = (conversation: HelpChatbotConversationSummary, selected: ConversationKey | null) =>
  selected !== null &&
  conversation.conversationId === selected.conversationId &&
  conversation.userId === selected.userId

type ConversationListProps = {
  query: Omit<GetHelpChatbotConversationsQuery, 'offset'>
  selected: ConversationKey | null
  onSelect: (key: ConversationKey) => void
}

const ConversationList = ({ query, selected, onSelect }: ConversationListProps) => {
  const { data, isLoading, isError, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useHelpChatbotConversations(query)

  if (isLoading) return <LoadingProgress />
  if (isError || !data) return <Alert severity="error">The conversations couldn&apos;t be loaded.</Alert>

  const conversations = data.pages.flatMap(page => page.conversations)
  const { total, totalQuestions } = data.pages[0]

  return (
    <Paper variant="outlined" sx={{ opacity: isFetching && !isFetchingNextPage ? 0.6 : 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: '10px 12px',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" role="status">
          <b>{formatNumber(total)}</b> {total === 1 ? 'conversation' : 'conversations'} · {formatNumber(totalQuestions)}{' '}
          {totalQuestions === 1 ? 'question' : 'questions'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Newest first
        </Typography>
      </Box>
      {conversations.length === 0 ? (
        <Typography sx={{ p: 2 }} color="text.secondary">
          No conversations match the filters.
        </Typography>
      ) : (
        <List disablePadding aria-label="Conversations">
          {conversations.map(conversation => {
            const current = isSelected(conversation, selected)
            const problems = describeProblems(conversation)
            return (
              <ListItem key={`${conversation.conversationId}:${conversation.userId}`} disablePadding divider>
                <ListItemButton
                  selected={current}
                  aria-current={current || undefined}
                  onClick={() => onSelect({ conversationId: conversation.conversationId, userId: conversation.userId })}
                  sx={{ display: 'block', py: 1, px: 1.5 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 600 }}>
                      {formatDateTime(conversation.startedAt)} · {conversation.username ?? 'unknown'}
                      {conversation.impersonatedUsername && (
                        <Box component="span" sx={{ color: 'warning.dark', fontWeight: 400 }}>
                          {' '}
                          as {conversation.impersonatedUsername}
                        </Box>
                      )}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {formatEuros(conversation.cost)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {[getUiLanguage(conversation.metadata), conversation.firstQuestion ?? '(cleared)']
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '2px 12px',
                      mt: 0.25,
                      fontSize: 13,
                    }}
                  >
                    <span>
                      {conversation.questions} {conversation.questions === 1 ? 'question' : 'questions'}
                    </span>
                    {conversation.up > 0 && (
                      <Box
                        component="span"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'primary.main' }}
                      >
                        <ThumbUpOutlined aria-hidden="true" sx={{ fontSize: 16 }} />
                        {conversation.up}
                        <Box component="span" sx={visuallyHidden}>
                          helpful
                        </Box>
                      </Box>
                    )}
                    {conversation.down > 0 && (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: 'error.main',
                          fontWeight: 600,
                        }}
                      >
                        <ThumbDownOutlined aria-hidden="true" sx={{ fontSize: 16 }} />
                        {conversation.down}
                        <Box component="span" sx={visuallyHidden}>
                          not helpful
                        </Box>
                        {conversation.comments > 0 && ` · ${conversation.comments} commented`}
                      </Box>
                    )}
                    {problems && (
                      <Box component="span" sx={{ color: 'warning.dark' }}>
                        {problems}
                      </Box>
                    )}
                  </Box>
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      )}
      {hasNextPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <NorButton color="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </NorButton>
        </Box>
      )}
    </Paper>
  )
}

export default ConversationList
