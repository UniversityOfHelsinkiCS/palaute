import React from 'react'
import { OPEN_UNIVERSITY_ORG_ID } from '../../../util/common'
import ExtraOrganisationModeSelector from './ExtraOrganisationModeSelector'
import SorterRowWithFilters from './SorterRow'

const SummaryRowFilters = ({ hideColumns = false }) => {
  const filterComponents = OPEN_UNIVERSITY_ORG_ID ? (
    <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />
  ) : null

  return <SorterRowWithFilters filterComponents={filterComponents} hideColumns={hideColumns} />
}

export default SummaryRowFilters
