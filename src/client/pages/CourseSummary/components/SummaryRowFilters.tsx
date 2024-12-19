import React from 'react'
import ViewingModeSelector from './ViewingModeSelector'
import { OPEN_UNIVERSITY_ORG_ID } from '../../../util/common'
import ExtraOrganisationModeSelector from './ExtraOrganisationModeSelector'
import SorterRowWithFilters from './SorterRow'

interface SummaryRowFiltersProps {
  filterType: 'my-organisation' | 'my-courses' | 'university' | 'course'
}

const SummaryRowFilters = ({ filterType = 'course' }: SummaryRowFiltersProps) => {
  const filterComponents = (
    <>
      {filterType === 'my-organisation' && <ViewingModeSelector />}
      {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
    </>
  )

  return <SorterRowWithFilters filterComponents={filterComponents} />
}

export default SummaryRowFilters
