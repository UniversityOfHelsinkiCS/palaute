import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getColor } from '../../../../../util/resultColors'
import { LIKERT_VALUES } from './counts'

// 0 is "don't know"
const BAR_VALUES = [...LIKERT_VALUES, 0]
const CHART_HEIGHT = 48

type LikertDistributionProps = {
  // Indexed by answer value, 0 being "don't know"
  counts: number[]
  // The largest share of any value in the table, for a scale shared by its rows
  maxShare: number
}

// A column for each answer value, the tallest at maxShare
const LikertDistribution = ({ counts, maxShare }: LikertDistributionProps) => {
  const { t } = useTranslation()

  const total = counts.reduce((sum, count) => sum + count, 0)
  const share = (value: number) => (total > 0 ? counts[value] / total : 0)
  const name = (value: number) => (value === 0 ? t('feedbackView:dontKnowOption') : String(value))

  return (
    <Box
      role="img"
      aria-label={BAR_VALUES.map(value => `${name(value)}: ${counts[value]}`).join(', ')}
      sx={{ display: 'flex', justifyContent: 'space-between', columnGap: 0.75 }}
    >
      {BAR_VALUES.map(value => (
        <Box
          key={value}
          sx={{
            flex: '0 1 4rem',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            typography: 'body2',
            lineHeight: 1.3,
          }}
        >
          <Box sx={{ fontVariantNumeric: 'tabular-nums' }}>{counts[value]}</Box>
          <Box
            sx={{
              width: '100%',
              height: `${Math.max(2, Math.round((maxShare > 0 ? share(value) / maxShare : 0) * CHART_HEIGHT))}px`,
              borderRadius: '2px 2px 0 0',
              backgroundColor: value === 0 ? 'grey.400' : getColor(value),
              printColorAdjust: 'exact',
            }}
          />
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>{name(value)}</Box>
        </Box>
      ))}
    </Box>
  )
}

export default LikertDistribution
