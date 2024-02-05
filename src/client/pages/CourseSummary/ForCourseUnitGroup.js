import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { useParams } from 'react-router'
import { OrganisationSummaryRow } from './SummaryRow'
import { useCourseUnitGroupSummaries, useSummaries } from './api'
import { SummaryContextProvider, useSummaryContext } from './context'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { OPEN_UNIVERSITY_ORG_ID } from '../../util/common'
import ExtraOrganisationModeSelector from './components/ExtraOrganisationModeSelector'
import { SorterRow } from './components/SorterRow'

const ForCourseUnitGroup = () => {
  const { code } = useParams()
  const { courseUnitGroup, isLoading } = useCourseUnitGroupSummaries({ courseCode: code })

  return (
    <SummaryScrollContainer>
      <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
        <SorterRow />
        {isLoading ? <LinearProgress /> : <div>XDD</div>}
      </Box>
    </SummaryScrollContainer>
  )
}

export default ForCourseUnitGroup
