import type { GetHelpChatbotFeedbackQuery, HelpChatbotRatingFilter } from '@common/types/helpChatbotAdmin'

import { ThumbDownOutlined, ThumbUpOutlined } from '@mui/icons-material'
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { useHelpChatbotFeedback } from './api'
import { formatDateTime, shortSha } from './format'
import { getUiLanguage } from './metadata'
import ReviewedCheckbox from './ReviewedCheckbox'
import useUrlFilters from './useUrlFilters'

const RATINGS: { value: HelpChatbotRatingFilter; label: string }[] = [
  { value: 'down', label: 'Thumbs down' },
  { value: 'up', label: 'Thumbs up' },
  { value: 'both', label: 'Both' },
]

const isRating = (value: string | undefined): value is HelpChatbotRatingFilter => RATINGS.some(r => r.value === value)

const conversationLink = (conversationId: string, userId: string | null, turnId: string) => {
  const params = new URLSearchParams({ c: conversationId, turn: turnId })
  if (userId !== null) params.set('u', userId)
  return `/admin/norppai/conversations?${params.toString()}`
}

const FeedbackView = () => {
  const { get, set } = useUrlFilters()

  const rating = get('rating')
  const query: GetHelpChatbotFeedbackQuery = {
    rating: isRating(rating) ? rating : 'down',
    withComment: get('comment') === 'true' || undefined,
    hideReviewed: get('hideReviewed') === 'true' || undefined,
    from: get('from'),
    to: get('to'),
  }
  const { data, isLoading, isError, isFetching } = useHelpChatbotFeedback(query)

  return (
    <Box>
      <Paper variant="outlined" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, p: 1.5, mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          aria-label="Rating"
          value={query.rating}
          onChange={(_, value: HelpChatbotRatingFilter | null) =>
            value && set({ rating: value === 'down' ? undefined : value })
          }
        >
          {RATINGS.map(option => (
            <ToggleButton key={option.value} value={option.value} sx={{ textTransform: 'none', px: 1.5 }}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={query.withComment === true}
              onChange={event => set({ comment: event.target.checked ? 'true' : undefined })}
            />
          }
          label="Only with a comment"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={query.hideReviewed === true}
              onChange={event => set({ hideReviewed: event.target.checked ? 'true' : undefined })}
            />
          }
          label="Hide reviewed"
        />
        <TextField
          label="From"
          type="date"
          size="small"
          value={query.from ?? ''}
          onChange={event => set({ from: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={query.to ?? ''}
          onChange={event => set({ to: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Paper>

      {isLoading && <LoadingProgress />}
      {isError && <Alert severity="error">The feedback couldn&apos;t be loaded.</Alert>}
      {data && (
        <Paper variant="outlined" sx={{ opacity: isFetching ? 0.6 : 1 }}>
          <Typography variant="body2" role="status" sx={{ p: '10px 14px', borderBottom: 1, borderColor: 'divider' }}>
            <b>{data.items.length}</b> rated answers, newest first
            {data.truncated && ' (only the newest are shown: narrow the dates to see older ones)'}
          </Typography>
          {data.items.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">
              No feedback matches the filters.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small" aria-label="Feedback" sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 140 }}>When</TableCell>
                    <TableCell sx={{ width: '26%' }}>Feedback</TableCell>
                    <TableCell>Question and answer</TableCell>
                    <TableCell sx={{ width: 110 }}>User</TableCell>
                    <TableCell sx={{ width: 90 }}>Version</TableCell>
                    <TableCell sx={{ width: 170 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map(item => (
                    <TableRow
                      key={item.turnId}
                      sx={{ verticalAlign: 'top', color: item.reviewedAt ? 'text.secondary' : 'text.primary' }}
                    >
                      <TableCell sx={{ color: 'inherit' }}>
                        <Box sx={{ fontWeight: 600 }}>{formatDateTime(item.createdAt)}</Box>
                        <Typography variant="body2" color="text.secondary">
                          {[getUiLanguage(item.metadata), item.status].filter(Boolean).join(' · ')}
                          {item.finishReason === 'length' && ', cut off'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'inherit' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 600,
                            color: item.rating === 'down' ? 'error.main' : 'primary.main',
                          }}
                        >
                          {item.rating === 'down' ? (
                            <ThumbDownOutlined aria-hidden="true" sx={{ fontSize: 18 }} />
                          ) : (
                            <ThumbUpOutlined aria-hidden="true" sx={{ fontSize: 18 }} />
                          )}
                          {item.rating === 'down' ? 'Not helpful' : 'Helpful'}
                        </Box>
                        {item.comment && <Box sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{item.comment}</Box>}
                      </TableCell>
                      <TableCell sx={{ color: 'inherit' }}>
                        <Box sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{item.question ?? '(cleared)'}</Box>
                        {item.answer && (
                          <Box
                            sx={{
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              color: 'text.secondary',
                            }}
                          >
                            {item.answer}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'inherit' }}>{item.username ?? 'unknown'}</TableCell>
                      <TableCell sx={{ color: 'inherit', fontFamily: 'monospace' }}>{shortSha(item.gitSha)}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={conversationLink(item.conversationId, item.userId, item.turnId)}
                        >
                          Open in conversation
                        </Link>
                        <ReviewedCheckbox turnId={item.turnId} reviewedAt={item.reviewedAt} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default FeedbackView
