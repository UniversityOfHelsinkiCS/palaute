import type { Ref } from 'react'

import { Box } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import ExternalLink from '../common/ExternalLink'
import ChatHeader from './ChatHeader'
import Composer from './Composer'
import EmptyState from './EmptyState'
import { primaryTint } from './tokens'

type ChatPanelProps = {
  guideUrl: string | null
  inputRef: Ref<HTMLTextAreaElement>
  draft: string
  onDraftChange: (draft: string) => void
  onClose: () => void
}

// Not an MUI Dialog, which is always modal
const ChatPanel = ({ guideUrl, inputRef, draft, onDraftChange, onClose }: ChatPanelProps) => {
  const { t } = useTranslation()
  const titleId = useId()

  return (
    <Box role="dialog" aria-labelledby={titleId} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatHeader titleId={titleId} onClose={onClose} />
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
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', p: '16px 14px' }}>
        <EmptyState hasGuide={guideUrl !== null} />
      </Box>
      <Composer inputRef={inputRef} draft={draft} onDraftChange={onDraftChange} />
    </Box>
  )
}

export default ChatPanel
