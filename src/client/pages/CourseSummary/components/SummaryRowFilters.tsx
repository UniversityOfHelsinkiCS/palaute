import React from 'react'
import ViewingModeSelector from './ViewingModeSelector'
import { OPEN_UNIVERSITY_ORG_ID } from '../../../util/common'
import ExtraOrganisationModeSelector from './ExtraOrganisationModeSelector'
import SorterRowWithFilters from './SorterRow'

interface SummaryRowFiltersProps {
  filterType: 'my-organisation' | 'my-courses' | 'university' | 'course'
}

const SummaryRowFilters = ({ filterType = 'course' }: SummaryRowFiltersProps) => {
  if (filterType === 'my-organisation') {
    return (
      <>
        <ViewingModeSelector />
        {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
        <SorterRowWithFilters />
      </>
    )
  }

  if (filterType === 'my-courses' || filterType === 'university') {
    return (
      <>
        {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
        <SorterRowWithFilters />
      </>
    )
  }

  return <SorterRowWithFilters />
}

export default SummaryRowFilters
