import React from 'react'
import { Box, FormControl, MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from './context'

const ExtraOrganisationModeSelector = ({ organisationId }) => {
  const { t } = useTranslation()
  const { setExtraOrgId, extraOrgMode, setExtraOrgMode } = useSummaryContext()

  const handleChange = value => {
    if (value === 'include') {
      setExtraOrgId('')
      setExtraOrgMode('include')
    }
    if (value === 'exclude') {
      setExtraOrgId(organisationId)
      setExtraOrgMode('exclude')
    }
    if (value === 'only') {
      setExtraOrgId(organisationId)
      setExtraOrgMode('only')
    }
  }

  return (
    <Box>
      <FormControl size="small">
        <Select value={extraOrgMode} onChange={e => handleChange(e.target.value)}>
          <MenuItem value="include">{t('courseSummary:includeOpenUni')}</MenuItem>
          <MenuItem value="exclude">{t('courseSummary:excludeOpenUni')}</MenuItem>
          <MenuItem value="only">{t('courseSummary:onlyOpenUni')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default ExtraOrganisationModeSelector
