import React from 'react'
import { Box } from '@mui/material'
import { subDays } from 'date-fns'
import { useSummaries } from './api'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

const SummaryV2 = () => {
  const { summaries, isLoading } = useSummaries({
    entityId: 'hy-university-root-id',
    startDate: new Date('2023-01-01'),
    endDate: subDays(new Date('2023-08-01'), 1),
  })

  if (isLoading) {
    return <LoadingProgress />
  }

  return <Box>Hello summary</Box>
}

export default SummaryV2
