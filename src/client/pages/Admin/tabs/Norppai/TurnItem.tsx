import type { HelpChatbotTurnStatus } from '@common/types/helpChatbot'
import type { NorppaiTurn } from '@common/types/helpChatbotAdmin'
import type { ChipProps } from '@mui/material'

import { ThumbDownOutlined, ThumbUpOutlined } from '@mui/icons-material'
import { Box, Chip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { forwardRef } from 'react'

import { AnswerMarkdown } from '../../../../components/HelpChatbot'
import { formatDuration, formatEuros, formatTime } from './format'
import { formatEntries, type MetadataEntry } from './metadata'
import ReviewedCheckbox from './ReviewedCheckbox'
import { describeOutsideHistory, describeTokens } from './turnText'

const STATUS_COLORS: Record<HelpChatbotTurnStatus, ChipProps['color']> = {
  answered: 'success',
  empty: 'warning',
  failed: 'error',
  aborted: 'default',
  pending: 'default',
}

type TurnItemProps = {
  turn: NorppaiTurn
  highlighted: boolean
  // Metadata that differs from the conversation's first turn
  metadataChanges: MetadataEntry[]
}

const TurnItem = forwardRef<HTMLLIElement, TurnItemProps>(({ turn, highlighted, metadataChanges }, ref) => {
  const outside = describeOutsideHistory(turn)
  const meta = [
    turn.finishReason,
    turn.durationMs === null ? null : formatDuration(turn.durationMs),
    describeTokens(turn),
    turn.cost === null ? null : formatEuros(turn.cost),
    turn.followsNumber !== null && turn.followsNumber !== turn.number - 1 ? `follows #${turn.followsNumber}` : null,
    turn.retriedAsNumber === null ? null : `asked again as #${turn.retriedAsNumber}`,
    metadataChanges.length > 0 ? formatEntries(metadataChanges) : null,
  ].filter(Boolean)

  return (
    <Box
      component="li"
      ref={ref}
      id={`turn-${turn.id}`}
      tabIndex={-1}
      sx={{
        py: 1.75,
        px: 2,
        mx: -2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: highlighted ? 'action.selected' : 'transparent',
        outline: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 12px',
          alignItems: 'center',
          fontSize: 12.5,
          color: 'text.secondary',
        }}
      >
        <Box component="h3" sx={{ m: 0, fontSize: 14, color: 'text.primary' }}>
          #{turn.number}
        </Box>
        <span>{formatTime(turn.createdAt)}</span>
        <Chip label={turn.status} size="small" color={STATUS_COLORS[turn.status]} variant="outlined" />
        {meta.map(item => (
          <span key={item}>{item}</span>
        ))}
      </Box>
      {outside && (
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
          {outside}
        </Typography>
      )}
      <Box
        sx={{
          mt: 1,
          p: '8px 12px',
          borderRadius: 2,
          bgcolor: theme => (outside ? theme.palette.grey[100] : alpha(theme.palette.primary.main, 0.08)),
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        <Box component="span" sx={{ fontWeight: 600 }}>
          Q:{' '}
        </Box>
        {turn.question ?? '(cleared)'}
      </Box>
      {turn.answer !== null && (
        <Box
          sx={{
            mt: 1,
            p: '8px 12px',
            borderRadius: 2,
            bgcolor: 'grey.100',
            overflowWrap: 'anywhere',
            '& p, & ul, & ol': { m: '0 0 8px' },
            '& ul, & ol': { pl: '20px' },
            '& > :last-child': { mb: 0 },
          }}
        >
          <AnswerMarkdown markdown={turn.answer} />
        </Box>
      )}
      {turn.rating !== null && (
        <Box
          sx={{
            mt: 1,
            p: '6px 12px',
            border: 1,
            borderRadius: 2,
            borderColor: turn.rating === 'down' ? 'error.light' : 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              color: turn.rating === 'down' ? 'error.main' : 'primary.main',
            }}
          >
            {turn.rating === 'down' ? (
              <ThumbDownOutlined aria-hidden="true" sx={{ fontSize: 18 }} />
            ) : (
              <ThumbUpOutlined aria-hidden="true" sx={{ fontSize: 18 }} />
            )}
            {turn.rating === 'down' ? 'Not helpful' : 'Helpful'}
          </Box>
          {turn.feedbackComment && (
            <Box sx={{ flex: '1 1 200px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {turn.feedbackComment}
            </Box>
          )}
          <Box sx={{ ml: 'auto' }}>
            <ReviewedCheckbox turnId={turn.id} reviewedAt={turn.feedbackReviewedAt} />
          </Box>
        </Box>
      )}
    </Box>
  )
})

TurnItem.displayName = 'TurnItem'

export default TurnItem
