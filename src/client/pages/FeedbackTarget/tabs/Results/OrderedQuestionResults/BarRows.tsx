import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Fragment } from 'react'

import { formatPercent } from './counts'
import { COLUMN_GAP, COUNT_COLUMNS } from './layout'

export type BarRow = {
  id: string | number
  label: string
  count: number
}

const numberSx = { m: 0, textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }

const BarRows = ({ rows, feedbackCount }: { rows: BarRow[]; feedbackCount: number }) => (
  <Box
    component="dl"
    sx={{
      m: 0,
      display: 'grid',
      gridTemplateColumns: { xs: 'minmax(0, 1fr) auto auto', md: `minmax(0, 1fr) ${COUNT_COLUMNS}` },
      columnGap: COLUMN_GAP,
      rowGap: 0.5,
      alignItems: 'center',
      '@media print': { breakInside: 'avoid' },
    }}
  >
    {rows.map(row => (
      <Fragment key={row.id}>
        <Box
          component="dt"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '2px',
            backgroundColor: 'action.hover',
            printColorAdjust: 'exact',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: '0 auto 0 0',
              width: `${feedbackCount > 0 ? Math.min(1, row.count / feedbackCount) * 100 : 0}%`,
              // Light enough for the label to read the same on and off the fill
              backgroundColor: theme => alpha(theme.palette.primary.light, 0.25),
              printColorAdjust: 'exact',
            }}
          />
          <Typography variant="body1" sx={{ position: 'relative', px: 1, py: 0.5, overflowWrap: 'anywhere' }}>
            {row.label}
          </Typography>
        </Box>
        <Typography component="dd" variant="body1" sx={numberSx}>
          {row.count}
        </Typography>
        <Typography component="dd" variant="body1" color="textSecondary" sx={numberSx}>
          {formatPercent(row.count, feedbackCount)}
        </Typography>
      </Fragment>
    ))}
  </Box>
)

export default BarRows
