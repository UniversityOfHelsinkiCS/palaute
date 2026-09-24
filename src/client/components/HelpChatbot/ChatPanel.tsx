import type { RefObject } from 'react'

import { Box, useMediaQuery } from '@mui/material'
import FocusTrap from '@mui/material/Unstable_TrapFocus'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { ChatEntry } from './types'

import ExternalLink from '../common/ExternalLink'
import ChatHeader from './ChatHeader'
import Composer from './Composer'
import { COMPACT_QUERY } from './layout'
import MessageList from './MessageList'
import { primaryTint } from './tokens'

type ChatPanelProps = {
  guideUrl: string | null
  inputRef: RefObject<HTMLTextAreaElement | null>
  entries: ChatEntry[]
  pending: boolean
  retryableId: string | null
  expanded: boolean
  fullScreen: boolean
  draft: string
  onDraftChange: (draft: string) => void
  onSend: () => void
  onReply: (text: string) => void
  onFailure: () => void
  onRetry: () => void
  onToggleExpand: () => void
  onNewConversation: () => void
  onClose: () => void
}

// Not an MUI Dialog, which is always modal
const ChatPanel = ({
  guideUrl,
  inputRef,
  entries,
  pending,
  retryableId,
  expanded,
  fullScreen,
  draft,
  onDraftChange,
  onSend,
  onReply,
  onFailure,
  onRetry,
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
        {guideUrl && (
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
            <ExternalLink href={guideUrl} sx={{ fontWeight: 600 }}>
              {t('helpChatbot:guideStripLink')}
            </ExternalLink>
          </Box>
        )}
        <MessageList
          entries={entries}
          pending={pending}
          retryableId={retryableId}
          compact={compact}
          hasGuide={guideUrl !== null}
          onReply={onReply}
          onFailure={onFailure}
          onRetry={onRetry}
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
