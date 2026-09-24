import { Close, RestartAlt } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'

type ChatHeaderProps = {
  titleId: string
  onNewConversation: () => void
  onClose: () => void
}

const ChatHeader = ({ titleId, onNewConversation, onClose }: ChatHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flex: 'none',
        height: 60,
        boxSizing: 'border-box',
        p: '0 8px 0 14px',
        borderBottom: '1px solid',
        borderColor: 'divider',
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
