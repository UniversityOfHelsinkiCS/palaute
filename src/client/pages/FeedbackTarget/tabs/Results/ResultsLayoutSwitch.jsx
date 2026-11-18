import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../../../components/common/NorButton'

// Not remembered, so that everyone gets the new layout each time
export const useOrderedLayout = () => useState(true)

const ResultsLayoutSwitch = ({ ordered, setOrdered }) => {
  const { t } = useTranslation()

  return (
    <Box
      data-cy="results-layout-switch"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 1,
        mt: 3,
        '@media print': { display: 'none' },
      }}
    >
      <Typography variant="body2" color="textSecondary">
        {t(ordered ? 'feedbackTargetResults:orderedLayoutInfo' : 'feedbackTargetResults:classicLayoutInfo')}
      </Typography>
      <NorButton color="empty" size="small" onClick={() => setOrdered(!ordered)}>
        {t(ordered ? 'feedbackTargetResults:useClassicLayout' : 'feedbackTargetResults:useOrderedLayout')}
      </NorButton>
    </Box>
  )
}

export default ResultsLayoutSwitch
