import type { RefObject } from 'react'

import { Box } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { ChatEntry } from './types'

import ExternalLink from '../common/ExternalLink'
import ChatHeader from './ChatHeader'
import Composer from './Composer'
import MessageList from './MessageList'
import { primaryTint } from './tokens'

type ChatPanelProps = {
  guideUrl: string | null
  inputRef: RefObject<HTMLTextAreaElement | null>
  entries: ChatEntry[]
  pending: boolean
  draft: string
  onDraftChange: (draft: string) => void
  onSend: () => void
  onReply: (text: string) => void
  onNewConversation: () => void
  onClose: () => void
}

// Not an MUI Dialog, which is always modal
const ChatPanel = ({
  guideUrl,
  inputRef,
  entries,
  pending,
  draft,
  onDraftChange,
  onSend,
  onReply,
  onNewConversation,
  onClose,
}: ChatPanelProps) => {
  const { t } = useTranslation()
  const titleId = useId()

  return (
    <Box role="dialog" aria-labelledby={titleId} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatHeader titleId={titleId} onNewConversation={onNewConversation} onClose={onClose} />
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
      <MessageList entries={entries} pending={pending} hasGuide={guideUrl !== null} onReply={onReply} />
      <Composer
        inputRef={inputRef}
        draft={draft}
        canSend={!pending && draft.trim() !== ''}
        onDraftChange={onDraftChange}
        onSend={onSend}
      />
    </Box>
  )
}

export default ChatPanel
