import { keyframes } from '@mui/material/styles'

// All 77 frames of public/seal.gif side by side, made with ImageMagick 6. -coalesce is required
// because the GIF's frames are partial:
//   convert public/seal.gif -coalesce -resize 80x80 +append -quality 80 \
//     src/client/components/HelpChatbot/assets/seal-sprite.webp
// The frames are 2x: 80px for the 40px widget seal, and 144px (seal-sprite-large.webp) for the 72px greeting seal
export { default as sealSprite } from './assets/seal-sprite.webp'
export { default as largeSealSprite } from './assets/seal-sprite-large.webp'

export const FRAME_COUNT = 77
// The GIF's frames are 30 ms each
export const CYCLE = '2.31s'

// For a strip of FRAME_COUNT frames, animated with steps(FRAME_COUNT)
export const flip = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
`
