import type { SxProps, Theme } from '@mui/material'

export const mergeSx = (...args: (SxProps<Theme> | undefined)[]): SxProps<Theme> =>
  args.flatMap(sx => (Array.isArray(sx) ? sx : [sx]))
