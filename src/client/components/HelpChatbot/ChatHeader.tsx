import { Close, CloseFullscreen, OpenInFull, RestartAlt } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { CHAT_HEADER_HEIGHT } from './layout'

type ChatHeaderProps = {
  titleId: string
  expanded: boolean
  canExpand: boolean
  sticky: boolean
  onToggleExpand: () => void
  onNewConversation: () => void
  onClose: () => void
}

const ChatHeader = ({
  titleId,
  expanded,
  canExpand,
  sticky,
  onToggleExpand,
  onNewConversation,
  onClose,
}: ChatHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flex: 'none',
        height: CHAT_HEADER_HEIGHT,
        boxSizing: 'border-box',
        p: '0 8px 0 14px',
        borderBottom: '1px solid',
        borderColor: 'divider',
        // When the whole panel scrolls, the header stays put, as the seal in it is fixed to the viewport
        ...(sticky && { position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' }),
      }}
    >
      {/* The seal slides into this slot */}
      <Box sx={{ flex: 'none', width: 32, height: 32 }} />
      <Box component="h2" id={titleId} sx={{ flex: '1 1 auto', m: 0, fontSize: '16px', fontWeight: 700 }}>
        {t('helpChatbot:askNorppai')}
      </Box>
      <Box sx={{ display: 'flex' }}>
        <Tooltip title={t('helpChatbot:newConversation')}>
          <IconButton
            aria-label={t('helpChatbot:newConversation')}
            onClick={onNewConversation}
            disableFocusRipple
            sx={focusIndicatorStyle()}
          >
            <RestartAlt fontSize="small" />
          </IconButton>
        </Tooltip>
        {canExpand && (
          // A constant name with a pressed state: screen readers announce a state change reliably,
          // but often miss a changed name on the focused button
          <Tooltip title={t(expanded ? 'helpChatbot:shrinkChat' : 'helpChatbot:expandChat')}>
            <IconButton
              aria-label={t('helpChatbot:expandChat')}
              aria-pressed={expanded}
              onClick={onToggleExpand}
              disableFocusRipple
              sx={focusIndicatorStyle()}
            >
              {expanded ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={t('helpChatbot:closeChat')}>
          <IconButton
            aria-label={t('helpChatbot:closeChat')}
            onClick={onClose}
            disableFocusRipple
            sx={focusIndicatorStyle()}
          >
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default ChatHeader
