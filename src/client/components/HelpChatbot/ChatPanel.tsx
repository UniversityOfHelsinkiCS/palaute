import type { RefObject } from 'react'

import { Box, Link, useMediaQuery } from '@mui/material'
import FocusTrap from '@mui/material/Unstable_TrapFocus'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { ChatEntry } from './types'
import type { FeedbackActions } from './useConversation'
import type { GuideLink } from './useGuideLink'

import ExternalLink from '../common/ExternalLink'
import ChatHeader from './ChatHeader'
import Composer from './Composer'
import { COMPACT_QUERY } from './layout'
import MessageList from './MessageList'
import { primaryTint } from './tokens'

type ChatPanelProps = {
  guide: GuideLink | null
  inputRef: RefObject<HTMLTextAreaElement | null>
  entries: ChatEntry[]
  pending: boolean
  retryableId: string | null
  expanded: boolean
  fullScreen: boolean
  draft: string
  onDraftChange: (draft: string) => void
  onSend: () => void
  onAnswer: (text: string) => void
  onFailure: () => void
  onRetry: () => void
  feedbackActions: FeedbackActions
  onAnnounce: (text: string) => void
  onToggleExpand: () => void
  onNewConversation: () => void
  onClose: () => void
}

// Not an MUI Dialog, which is always modal
const ChatPanel = ({
  guide,
  inputRef,
  entries,
  pending,
  retryableId,
  expanded,
  fullScreen,
  draft,
  onDraftChange,
  onSend,
  onAnswer,
  onFailure,
  onRetry,
  feedbackActions,
  onAnnounce,
  onToggleExpand,
  onNewConversation,
  onClose,
}: ChatPanelProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const compact = useMediaQuery(COMPACT_QUERY)

  return (
    // Full-screen, the panel covers the page, so it becomes modal: Tab can't reach content hidden behind it
    <FocusTrap open={fullScreen} disableAutoFocus disableRestoreFocus>
      <Box
        role="dialog"
        aria-labelledby={titleId}
        aria-modal={fullScreen || undefined}
        tabIndex={fullScreen ? -1 : undefined}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          outline: 'none',
          // Too short for a separately scrolling message list: everything scrolls as one
          ...(compact && { overflowY: 'auto' }),
        }}
      >
        <ChatHeader
          titleId={titleId}
          expanded={expanded}
          canExpand={!fullScreen}
          sticky={compact}
          onToggleExpand={onToggleExpand}
          onNewConversation={onNewConversation}
          onClose={onClose}
        />
        {guide && (
          <Box
            sx={{
              flex: 'none',
              p: '7px 14px',
              bgcolor: primaryTint,
              borderBottom: '1px solid',
              borderColor: 'divider',
              fontSize: '13px',
              color: 'text.secondary',
            }}
          >
            {t('helpChatbot:guideStripPrefix')}{' '}
            {guide.inApp ? (
              // The full-screen chat covers the page, so it closes to show the guide
              <Link
                component={RouterLink}
                to={guide.href}
                underline="always"
                onClick={fullScreen ? onClose : undefined}
                sx={{ fontWeight: 600 }}
              >
                {t('helpChatbot:guideStripLink')}
              </Link>
            ) : (
              <ExternalLink href={guide.href} sx={{ fontWeight: 600 }}>
                {t('helpChatbot:guideStripLink')}
              </ExternalLink>
            )}
          </Box>
        )}
        <MessageList
          entries={entries}
          pending={pending}
          retryableId={retryableId}
          compact={compact}
          onAnswer={onAnswer}
          onFailure={onFailure}
          onRetry={onRetry}
          feedbackActions={feedbackActions}
          onAnnounce={onAnnounce}
        />
        <Composer
          inputRef={inputRef}
          draft={draft}
          canSend={!pending && draft.trim() !== ''}
          onDraftChange={onDraftChange}
          onSend={onSend}
        />
      </Box>
    </FocusTrap>
  )
}

export default ChatPanel
