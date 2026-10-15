import { keyframes } from '@mui/material/styles'

// public/seal.gif's frames side by side at 2x, made with ImageMagick 6. -coalesce is required because the
// GIF's frames are partial:
//   convert public/seal.gif -coalesce -resize 80x80 +append -quality 80 \
//     src/client/components/HelpChatbot/assets/seal-sprite.webp
//   convert public/seal.gif -coalesce -resize 144x144 +append -quality 80 \
//     src/client/components/HelpChatbot/assets/seal-sprite-large.webp
//   convert 'public/seal.gif[0]' -resize 144x144 -quality 80 src/client/components/HelpChatbot/assets/seal-large.webp
export { default as sealSprite } from './assets/seal-sprite.webp'
export { default as largeSealSprite } from './assets/seal-sprite-large.webp'
export { default as largeSealStill } from './assets/seal-large.webp'

export const FRAME_COUNT = 77
// The GIF's frames are 30 ms each
export const CYCLE = '2.31s'

// For a strip of FRAME_COUNT frames, animated with steps(FRAME_COUNT)
export const flip = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
`
