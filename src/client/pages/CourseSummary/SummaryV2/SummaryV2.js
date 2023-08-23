import React from 'react'
import { Box, Typography } from '@mui/material'
import { subDays } from 'date-fns'
import OrganisationSummaryRow from './SummaryRow'
import { useSummaries } from './api'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import LinkButton from '../../../components/common/LinkButton'

const SummaryV2 = () => {
  const startDate = new Date('2023-01-01')
  const endDate = subDays(new Date('2023-08-01'), 1)
  const entityId = 'hy-university-root-id'

  const { organisation, questions, isLoading } = useSummaries({
    entityId,
    startDate,
    endDate,
  })

  return (
    <Box>
      <Box mb={6} px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            MINTUfied kurssiyhteenveto (ALPHA)
          </Typography>
          <LinkButton to="/course-summary" title="unmintufy" />
        </Box>
        <Typography variant="subtitle1">Vain admineille</Typography>
      </Box>
      {isLoading ? (
        <LoadingProgress />
      ) : (
        <OrganisationSummaryRow
          entityId={entityId}
          organisation={organisation}
          questions={questions}
          startDate={startDate}
          endDate={endDate}
          isInitiallyOpen
        />
      )}
    </Box>
  )
}

export default SummaryV2
