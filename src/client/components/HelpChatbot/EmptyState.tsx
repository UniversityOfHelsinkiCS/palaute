import { InfoOutlined } from '@mui/icons-material'
import { Box, useMediaQuery } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CYCLE, FRAME_COUNT, flip, largeSealSprite } from './sealSprite'

const SEAL_IMAGE_SIZE = 72

const bounce = keyframes`
  30% { transform: scale(0.85); }
  60% { transform: scale(1.08); }
  80% { transform: scale(0.97); }
`

type EmptyStateProps = {
  hasGuide: boolean
}

const EmptyState = ({ hasGuide }: EmptyStateProps) => {
  const { t } = useTranslation()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [sealPlaying, setSealPlaying] = useState(false)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        p: '28px 12px 0',
        textAlign: 'center',
        '& p': { m: 0, maxWidth: 290, color: 'text.secondary' },
      }}
    >
      {/* An easter egg, hidden from keyboard and screen reader users because it does nothing useful */}
      <Box
        component="button"
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => !reduceMotion && setSealPlaying(true)}
        sx={{
          position: 'relative',
          width: SEAL_IMAGE_SIZE,
          height: SEAL_IMAGE_SIZE,
          mb: '6px',
          p: 0,
          border: 0,
          bgcolor: 'transparent',
          overflow: 'hidden',
          // Nothing hints that it can be clicked
          cursor: 'default',
          animation: sealPlaying ? `${bounce} .5s ease` : 'none',
        }}
      >
        {/* The first frame doubles as the still image */}
        <Box
          component="img"
          src={largeSealSprite}
          alt=""
          onAnimationEnd={() => setSealPlaying(false)}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SEAL_IMAGE_SIZE * FRAME_COUNT,
            height: SEAL_IMAGE_SIZE,
            maxWidth: 'none',
            animation: sealPlaying ? `${flip} ${CYCLE} steps(${FRAME_COUNT}) 1` : 'none',
          }}
        />
      </Box>
      <Box component="h3" sx={{ m: 0, fontSize: '17px', fontWeight: 700 }}>
        {t('helpChatbot:greetingTitle')}
      </Box>
      <p>{t('helpChatbot:greetingBody')}</p>
      <Box
        component="p"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          mt: '10px !important',
          fontSize: '12.5px',
          textAlign: 'left',
        }}
      >
        <InfoOutlined aria-hidden="true" sx={{ flex: 'none', fontSize: 15, mt: '2px' }} />
        <span>
          {t('helpChatbot:disclaimer')}
          {hasGuide && ` ${t('helpChatbot:disclaimerGuide')}`}
        </span>
      </Box>
    </Box>
  )
}

export default EmptyState
