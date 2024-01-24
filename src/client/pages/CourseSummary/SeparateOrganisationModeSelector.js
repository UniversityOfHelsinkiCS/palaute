import React from 'react'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from './context'

const SeparateOrganisationModeSelector = ({ organisationId }) => {
  const { t } = useTranslation()
  const {
    separateOrganisationId,
    setSeparateOrganisationId,
    showSeparateOrganisationCourses,
    setShowSeparateOrganisationCourses,
  } = useSummaryContext()

  const handleChange = (_ev, value) => {
    if (value === 'include') {
      setSeparateOrganisationId('')
      setShowSeparateOrganisationCourses(true)
    }
    if (value === 'separate') {
      setSeparateOrganisationId(organisationId)
      setShowSeparateOrganisationCourses(true)
    }
    if (value === 'hide') {
      setSeparateOrganisationId(organisationId)
      setShowSeparateOrganisationCourses(false)
    }
  }

  const getToggleButtonValue = () => {
    if (separateOrganisationId === organisationId && showSeparateOrganisationCourses) return 'separate'
    if (separateOrganisationId === organisationId && !showSeparateOrganisationCourses) return 'hide'
    return 'include'
  }

  return (
    <ToggleButtonGroup
      exclusive
      value={getToggleButtonValue()}
      onChange={handleChange}
      color="primary"
      size="small"
      sx={{ height: '40px' }}
    >
      <ToggleButton value="include">{t('courseSummary:includeOpenUni')}</ToggleButton>
      <ToggleButton value="separate">{t('courseSummary:separateOpenUni')}</ToggleButton>
      <ToggleButton value="hide">{t('courseSummary:hideOpenUni')}</ToggleButton>
    </ToggleButtonGroup>
  )
}

export default SeparateOrganisationModeSelector
