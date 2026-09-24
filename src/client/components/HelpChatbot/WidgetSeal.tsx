import { Box } from '@mui/material'

import type { SealPlacement } from './layout'

import { mergeSx } from '../../util/sx'
// All 77 frames of public/seal.gif at 80px (2x), made with ImageMagick 6. -coalesce is required
// because the GIF's frames are partial:
//   convert public/seal.gif -coalesce -resize 80x80 +append -quality 80 \
//     src/client/components/HelpChatbot/assets/seal-sprite.webp
import sealSprite from './assets/seal-sprite.webp'
import { SEAL_SIZE, anchorSx, widgetZIndex } from './layout'

const FRAME_COUNT = 77

type WidgetSealProps = {
  placement: SealPlacement
}

const WidgetSeal = ({ placement }: WidgetSealProps) => (
  <Box
    aria-hidden="true"
    sx={mergeSx(anchorSx, {
      zIndex: theme => widgetZIndex(theme) + 1,
      width: SEAL_SIZE,
      height: SEAL_SIZE,
      overflow: 'hidden',
      pointerEvents: 'none',
      transformOrigin: '100% 100%',
      transform: `translate(calc(${placement.right} * -1), calc(${placement.bottom} * -1)) scale(${placement.scale})`,
    })}
  >
    <Box
      component="img"
      src={sealSprite}
      alt=""
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: SEAL_SIZE * FRAME_COUNT,
        height: SEAL_SIZE,
        maxWidth: 'none',
      }}
    />
  </Box>
)

export default WidgetSeal
