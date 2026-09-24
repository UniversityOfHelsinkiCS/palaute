import { Box } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { useState } from 'react'

import type { SealPlacement } from './layout'

import { mergeSx } from '../../util/sx'
// All 77 frames of public/seal.gif at 80px (2x), made with ImageMagick 6. -coalesce is required
// because the GIF's frames are partial:
//   convert public/seal.gif -coalesce -resize 80x80 +append -quality 80 \
//     src/client/components/HelpChatbot/assets/seal-sprite.webp
import sealSprite from './assets/seal-sprite.webp'
import { SEAL_SIZE, TRANSITION, anchorSx, widgetZIndex } from './layout'

const FRAME_COUNT = 77
// The GIF's frames are 30 ms each
const CYCLE = '2.31s'

const flip = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-${SEAL_SIZE * FRAME_COUNT}px); }
`

type WidgetSealProps = {
  placement: SealPlacement
  fullScreen: boolean
  once: boolean
  loop: boolean
  onOnceEnd: () => void
}

// JavaScript only switches the animation; driving the frames from React state stuttered
const WidgetSeal = ({ placement, fullScreen, once, loop, onOnceEnd }: WidgetSealProps) => {
  // Keeps looping after `loop` turns off, until the current cycle ends, instead of snapping back
  const [finishingLoop, setFinishingLoop] = useState(false)

  const looping = loop || finishingLoop
  const animation = looping
    ? `${flip} ${CYCLE} steps(${FRAME_COUNT}) infinite`
    : once
      ? `${flip} ${CYCLE} steps(${FRAME_COUNT}) 1`
      : 'none'

  return (
    <Box
      aria-hidden="true"
      sx={mergeSx(anchorSx(fullScreen), {
        zIndex: theme => widgetZIndex(theme) + 1,
        width: SEAL_SIZE,
        height: SEAL_SIZE,
        overflow: 'hidden',
        pointerEvents: 'none',
        transformOrigin: '100% 100%',
        transform: `translate(calc(${placement.right} * -1), calc(${placement.bottom} * -1)) scale(${placement.scale})`,
        transition: `transform ${TRANSITION}, right ${TRANSITION}, bottom ${TRANSITION}`,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      })}
    >
      <Box
        component="img"
        src={sealSprite}
        alt=""
        onAnimationStart={() => loop && setFinishingLoop(true)}
        onAnimationIteration={() => setFinishingLoop(loop)}
        onAnimationEnd={onOnceEnd}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: SEAL_SIZE * FRAME_COUNT,
          height: SEAL_SIZE,
          maxWidth: 'none',
          animation,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
    </Box>
  )
}

export default WidgetSeal
