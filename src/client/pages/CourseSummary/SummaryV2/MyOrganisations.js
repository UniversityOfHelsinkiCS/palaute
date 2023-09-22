import React from 'react'
import { Box } from '@mui/material'
import OrganisationSummaryRow from './SummaryRow'
import useAuthorizedUser from '../../../hooks/useAuthorizedUser'
import { useSummaryContext } from './context'

const useRootOrganisations = organisations => {
  const rootOrganisations = React.useMemo(() => organisations.map(o => o.organisation), [organisations])

  return rootOrganisations
}

/**
 *
 */
const MyOrganisations = () => {
  const { authorizedUser: user } = useAuthorizedUser()
  const rootOrganisations = useRootOrganisations(user.organisations)
  const { dateRange } = useSummaryContext()

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.4rem">
      {rootOrganisations.map(organisation => (
        <OrganisationSummaryRow
          key={organisation.id}
          loadClosed
          alwaysOpen={rootOrganisations.length === 1}
          organisationId={organisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
        />
      ))}
    </Box>
  )
}

export default MyOrganisations
