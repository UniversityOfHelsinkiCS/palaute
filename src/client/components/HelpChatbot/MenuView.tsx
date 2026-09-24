import type { SxProps, Theme } from '@mui/material'
import type { Ref } from 'react'

import { Close, MenuBookOutlined } from '@mui/icons-material'
import { Box, IconButton, Link, Tooltip } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { SEAL_SIZE } from './layout'
import { focusRing, primaryTint, primaryTintBorder } from './tokens'

const optionSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  height: 60,
  boxSizing: 'border-box',
  p: '8px 12px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '10px',
  bgcolor: 'background.paper',
  font: 'inherit',
  color: 'text.primary',
  textAlign: 'left',
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': { bgcolor: primaryTint, borderColor: primaryTintBorder },
  '&:focus-visible': focusRing,
}

const iconSlotSx: SxProps<Theme> = {
  flex: 'none',
  width: SEAL_SIZE,
  height: SEAL_SIZE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const labelSx: SxProps<Theme> = { display: 'block', fontSize: '14px', fontWeight: 700 }
const descriptionSx: SxProps<Theme> = { display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'text.secondary' }

type MenuViewProps = {
  guideUrl: string
  askRef: Ref<HTMLButtonElement>
  onAsk: () => void
  onClose: () => void
}

const MenuView = ({ guideUrl, askRef, onAsk, onClose }: MenuViewProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const guideLabelId = useId()
  const guideDescriptionId = useId()

  return (
    <Box role="group" aria-labelledby={titleId} sx={{ height: '100%', boxSizing: 'border-box', p: '8px 12px 12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', height: 36, mb: '6px' }}>
        <Box
          component="p"
          id={titleId}
          sx={{ flex: '1 1 auto', m: '0 4px', fontSize: '13px', fontWeight: 700, color: 'text.secondary' }}
        >
          {t('helpChatbot:menuTitle')}
        </Box>
        <Tooltip title={t('helpChatbot:closeMenu')}>
          <IconButton
            aria-label={t('helpChatbot:closeMenu')}
            onClick={onClose}
            disableFocusRipple
            sx={focusIndicatorStyle()}
          >
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* The visible description is the new-tab indication, so no ExternalLink icon or hidden text here */}
        <Link
          href={guideUrl}
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
          aria-labelledby={guideLabelId}
          aria-describedby={guideDescriptionId}
          onClick={onClose}
          sx={optionSx}
        >
          <Box component="span" sx={iconSlotSx}>
            <MenuBookOutlined aria-hidden="true" sx={{ fontSize: 28, color: 'primary.main' }} />
          </Box>
          <span>
            <Box component="span" id={guideLabelId} sx={labelSx}>
              {t('helpChatbot:guideOption')}
            </Box>
            <Box component="span" id={guideDescriptionId} sx={descriptionSx}>
              {t('helpChatbot:guideOptionDescription')}
            </Box>
          </span>
        </Link>
        <Box component="button" type="button" ref={askRef} onClick={onAsk} sx={optionSx}>
          {/* The seal slides into this slot */}
          <Box component="span" sx={iconSlotSx} />
          <Box component="span" sx={labelSx}>
            {t('helpChatbot:askNorppai')}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MenuView
