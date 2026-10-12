import type {
  GetNorppaiConversationsQuery,
  NorppaiFeedbackFilter,
  NorppaiProblemFilter,
} from '@common/types/helpChatbotAdmin'

import { Box, MenuItem, Paper, TextField, Typography } from '@mui/material'

import type { ConversationKey } from './api'

import { NorButton } from '../../../../components/common/NorButton'
import ConversationDetail from './ConversationDetail'
import ConversationList from './ConversationList'
import DebouncedTextField from './DebouncedTextField'
import useUrlFilters, { daysAgo, today } from './useUrlFilters'

const FEEDBACK_OPTIONS: { value: NorppaiFeedbackFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'down', label: 'Has thumbs down' },
  { value: 'comment', label: 'Has a comment' },
  { value: 'up', label: 'Has thumbs up' },
  { value: 'none', label: 'No feedback' },
]

const PROBLEM_OPTIONS: { value: NorppaiProblemFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'empty', label: 'Empty answer' },
  { value: 'failed', label: 'Failed' },
  { value: 'aborted', label: 'Aborted' },
  { value: 'cutOff', label: 'Cut off (token limit)' },
]

const DEFAULT_DAYS = 30

const isOneOf = <T extends string>(options: { value: T }[], value: string | undefined): value is T =>
  options.some(option => option.value === value)

const ConversationsView = () => {
  const { get, set } = useUrlFilters()

  const feedback = get('feedback')
  const problems = get('problems')
  const query: Omit<GetNorppaiConversationsQuery, 'offset'> = {
    from: get('from') ?? daysAgo(DEFAULT_DAYS - 1),
    to: get('to') ?? today(),
    search: get('q'),
    feedback: isOneOf(FEEDBACK_OPTIONS, feedback) ? feedback : undefined,
    problems: isOneOf(PROBLEM_OPTIONS, problems) ? problems : undefined,
    user: get('user'),
  }

  const conversationId = get('c')
  const selected: ConversationKey | null = conversationId ? { conversationId, userId: get('u') ?? null } : null

  const clear = () =>
    set({
      q: undefined,
      from: undefined,
      to: undefined,
      feedback: undefined,
      problems: undefined,
      user: undefined,
    })

  return (
    <Box>
      <Paper
        component="form"
        variant="outlined"
        onSubmit={event => event.preventDefault()}
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 1.5, p: 1.5 }}
      >
        <DebouncedTextField
          label="Search questions and answers"
          type="search"
          size="small"
          value={query.search ?? ''}
          onChange={q => set({ q: q || undefined })}
          sx={{ flex: '2 1 260px' }}
        />
        <TextField
          label="From"
          type="date"
          size="small"
          value={query.from}
          onChange={event => set({ from: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={query.to}
          onChange={event => set({ to: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          label="Feedback"
          size="small"
          value={query.feedback ?? 'any'}
          onChange={event => set({ feedback: event.target.value === 'any' ? undefined : event.target.value })}
          sx={{ minWidth: 170 }}
        >
          {FEEDBACK_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Problems"
          size="small"
          value={query.problems ?? 'any'}
          onChange={event => set({ problems: event.target.value === 'any' ? undefined : event.target.value })}
          sx={{ minWidth: 170 }}
        >
          {PROBLEM_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <DebouncedTextField
          label="User"
          size="small"
          value={query.user ?? ''}
          onChange={user => set({ user: user || undefined })}
          sx={{ width: 150 }}
        />
        <NorButton color="secondary" onClick={clear}>
          Clear filters
        </NorButton>
      </Paper>
      <Typography variant="body2" color="text.secondary" sx={{ m: '6px 2px 14px' }}>
        Days are in Helsinki time. The filters and the open conversation are in the URL, so a link opens the same view.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '1 1 440px', minWidth: 0 }}>
          <ConversationList
            query={query}
            selected={selected}
            onSelect={key =>
              set({ c: key.conversationId, u: key.userId ?? undefined, turn: undefined }, { push: true })
            }
          />
        </Box>
        <Box sx={{ flex: '999 1 560px', minWidth: 0 }}>
          {selected ? (
            <ConversationDetail conversationKey={selected} highlightedTurnId={get('turn') ?? null} />
          ) : (
            <Paper variant="outlined" sx={{ p: 3, color: 'text.secondary' }}>
              Pick a conversation to read it.
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ConversationsView
