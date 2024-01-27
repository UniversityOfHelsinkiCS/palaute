import React from 'react'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from './context'

const ExtraOrganisationModeSelector = ({ organisationId }) => {
  const { t } = useTranslation()
  const { setExtraOrgId, extraOrgMode, setExtraOrgMode } = useSummaryContext()

  const handleChange = (_ev, value) => {
    if (value === 'include') {
      setExtraOrgId('')
      setExtraOrgMode('')
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
    <ToggleButtonGroup
      exclusive
      value={extraOrgMode}
      onChange={handleChange}
      color="primary"
      size="small"
      sx={{ height: '40px' }}
    >
      <ToggleButton value="include">{t('courseSummary:includeOpenUni')}</ToggleButton>
      <ToggleButton value="exclude">{t('courseSummary:excludeOpenUni')}</ToggleButton>
      <ToggleButton value="only">{t('courseSummary:onlyOpenUni')}</ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ExtraOrganisationModeSelector
