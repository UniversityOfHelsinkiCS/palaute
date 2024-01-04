import React from 'react'
import { FormControl, InputLabel, LinearProgress, MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { SummaryContextProvider, useSummaryContext } from './context'
import SummaryScrollContainer from './SummaryScrollContainer'
import { TAGS_ENABLED } from '../../../util/common'
import useOrganisationTags from '../../../hooks/useOrganisationTags'
import { getLanguageValue } from '../../../util/languageUtils'

const TagSelector = ({ organisation, tagId, setTagId }) => {
  const { t, i18n } = useTranslation()
  const { tags } = useOrganisationTags(organisation.code)
  const sortedTags = _.sortBy(tags ?? [], tag => getLanguageValue(tag.name, i18n.language))

  const handleChange = event => {
    setTagId(event.target.value)
  }

  return (
    <FormControl fullWidth sx={{ mt: '1rem' }} size="small">
      <InputLabel id="demo-simple-select-label">{t('courseSummary:tagLabel')}</InputLabel>
      <Select value={tagId ?? ''} label={t('courseSummary:tagLabel')} onChange={handleChange}>
        <MenuItem value="All">{t('courseSummary:allTags')}</MenuItem>
        {sortedTags.map(tag => (
          <MenuItem key={tag.id} value={tag.id}>
            {getLanguageValue(tag.name, i18n.language)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const OrganisationSummaryInContext = ({ organisation: initialOrganisation }) => {
  const { dateRange, tagId, setTagId } = useSummaryContext()

  const { organisation, isLoading } = useSummaries({
    entityId: initialOrganisation.id,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
    tagId,
  })

  const tagsEnabled = TAGS_ENABLED.includes(initialOrganisation.code)

  return (
    <SummaryScrollContainer>
      <SorterRow
        extraFilters={
          tagsEnabled && <TagSelector organisation={initialOrganisation} tagId={tagId} setTagId={setTagId} />
        }
      />
      {isLoading ? (
        <LinearProgress />
      ) : (
        <OrganisationSummaryRow
          alwaysOpen
          organisationId={initialOrganisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
        />
      )}
    </SummaryScrollContainer>
  )
}

const ForOrganisation = ({ organisation }) => (
  <SummaryContextProvider organisationCode={organisation.code}>
    <OrganisationSummaryInContext organisation={organisation} />
  </SummaryContextProvider>
)

export default ForOrganisation
