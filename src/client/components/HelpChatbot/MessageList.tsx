import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'

import { ErrorOutline } from '@mui/icons-material'
import { Box, useMediaQuery } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { ChatEntry } from './types'

import { NorButton } from '../common/NorButton'
import AssistantMarkdown from './AssistantMarkdown'
import EmptyState from './EmptyState'
import { CHAT_HEADER_HEIGHT } from './layout'
import { userBubbleColor } from './tokens'

const REPLY_SCROLL_MARGIN = 12

// Fading the text out would drop it below 4.5:1 contrast, so it pulses between two text colours that both pass
const pulse = (theme: Theme) => keyframes`
  50% { color: ${theme.palette.text.primary}; }
`

const bubbleSx: SystemStyleObject<Theme> = {
  boxSizing: 'border-box',
  p: '9px 12px',
  overflowWrap: 'anywhere',
  // Transparent until forced-colours mode, where the background disappears
  border: '1px solid transparent',
}

type MessageListProps = {
  entries: ChatEntry[]
  pending: boolean
  retryableId: string | null
  compact: boolean
  hasGuide: boolean
  onReply: (text: string) => void
  onFailure: () => void
  onRetry: () => void
}

const MessageList = ({
  entries,
  pending,
  retryableId,
  compact,
  hasGuide,
  onReply,
  onFailure,
  onRetry,
}: MessageListProps) => {
  const { t } = useTranslation()
  const bodyRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  // null until the first render after the chat opens
  const previous = useRef<{ count: number; pending: boolean; failed: boolean } | null>(null)

  useEffect(() => {
    const body = bodyRef.current
    // In compact mode the whole dialog scrolls instead of the list
    const scroller = compact ? body?.closest<HTMLElement>('[role="dialog"]') : body
    if (!body || !scroller) return
    const last = entries.at(-1)
    const failed = last?.role === 'user' && last.status === 'failed'
    const before = previous.current
    previous.current = { count: entries.length, pending, failed }

    const lastItem = last ? body.querySelector<HTMLElement>(`[data-entry-id="${last.id}"]`) : null
    const behavior = before && !reduceMotion ? 'smooth' : 'auto'
    const scrollToBottom = () => scroller.scrollTo({ top: scroller.scrollHeight, behavior })
    // A long reply is shown from its start, not from its last line
    const scrollToLastItem = () => {
      if (!lastItem) return
      const offset = lastItem.getBoundingClientRect().top - scroller.getBoundingClientRect().top
      const stickyHeader = compact ? CHAT_HEADER_HEIGHT : 0
      scroller.scrollTo({ top: scroller.scrollTop + offset - stickyHeader - REPLY_SCROLL_MARGIN, behavior })
    }

    if (!before) {
      if (last?.role === 'assistant') scrollToLastItem()
      else scrollToBottom()
    } else if (entries.length > before.count && last?.role === 'assistant' && lastItem) {
      scrollToLastItem()
      onReply(lastItem.innerText)
    } else if (pending && !before.pending) {
      scrollToBottom()
    } else if (failed && !before.failed) {
      onFailure()
    }
  }, [entries, pending, compact, reduceMotion, onReply, onFailure])

  return (
    <Box
      ref={bodyRef}
      sx={{
        flex: compact ? 'none' : '1 1 auto',
        minHeight: 0,
        overflowY: compact ? 'visible' : 'auto',
        overscrollBehavior: 'contain',
        p: '16px 14px',
      }}
    >
      {entries.length === 0 && <EmptyState hasGuide={hasGuide} />}
      {entries.length > 0 && (
        <Box
          component="ul"
          role="list"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {entries.map(entry =>
            entry.role === 'user' ? (
              <Box
                component="li"
                key={entry.id}
                data-entry-id={entry.id}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
              >
                <Box
                  sx={{
                    ...bubbleSx,
                    maxWidth: '82%',
                    bgcolor: userBubbleColor,
                    borderRadius: '14px 14px 4px 14px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <Box component="span" sx={visuallyHidden}>
                    {t('helpChatbot:youPrefix')}{' '}
                  </Box>
                  {entry.text}
                </Box>
                {entry.status === 'failed' && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      mt: '6px',
                      fontSize: '13px',
                      color: 'error.main',
                    }}
                  >
                    <ErrorOutline aria-hidden="true" sx={{ fontSize: 16 }} />
                    <span>{t('helpChatbot:noAnswer')}</span>
                    {entry.id === retryableId && (
                      <NorButton color="empty" size="small" onClick={onRetry} sx={{ textTransform: 'none' }}>
                        {t('helpChatbot:retry')}
                      </NorButton>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box component="li" key={entry.id} data-entry-id={entry.id} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    ...bubbleSx,
                    maxWidth: '88%',
                    bgcolor: 'grey.100',
                    borderRadius: '14px 14px 14px 4px',
                    '& p, & ul, & ol': { m: '0 0 8px' },
                    '& ul, & ol': { pl: '20px' },
                    '& > :last-child': { mb: 0 },
                  }}
                >
                  <Box component="span" sx={visuallyHidden}>
                    {t('helpChatbot:norppaiPrefix')}{' '}
                  </Box>
                  <AssistantMarkdown markdown={entry.markdown} />
                </Box>
              </Box>
            )
          )}
        </Box>
      )}
      {pending && (
        <Box
          sx={theme => ({
            mt: '14px',
            fontSize: '13.5px',
            color: 'text.secondary',
            animation: `${pulse(theme)} 1.6s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          })}
        >
          {t('helpChatbot:thinking')}
        </Box>
      )}
    </Box>
  )
}

export default MessageList
