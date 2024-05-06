import React, { useEffect } from 'react'

import { Box } from '@mui/material'
import { debounce } from 'lodash-es'

import apiClient from '../../../../util/apiClient'
import useHistoryState from '../../../../hooks/useHistoryState'

import LocalesSearchField from '../../Inspector/LocalesSearchField'
import InspectorResults from '../../Inspector/InspectorResults'
import { parseDates } from '../../Inspector/utils'
import TextSearchField from '../../Inspector/TextSearchField'

const OrganisationSurveyInspector = () => {
  const [potentialOrganisationSurveys, setPotentialOrganisationSurveys] = useHistoryState(
    'potentialOrganisationSurveys',
    []
  )
  const [count, setCount] = useHistoryState('potentialOrganisationSurveyCount', 0)

  const [query, setQuery] = useHistoryState('organisationSurveyQuery', {
    id: '',
    orgCode: '',
    name: '',
    language: 'fi',
  })

  const runQuery = debounce(async params => {
    const { data } = await apiClient.get('/admin/organisation-surveys', { params })
    const { feedbackTargets, count } = data

    setPotentialOrganisationSurveys(parseDates(feedbackTargets))
    setCount(count)
  }, 600)

  const handleChange = values => {
    const newQuery = { ...query, ...values }
    setQuery(newQuery)
    runQuery(newQuery)
  }

  useEffect(() => {
    runQuery(query)
  }, [])

  return (
    <Box mt={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
        <TextSearchField
          label="ID"
          value={query.id}
          onFocus={() => setQuery({ ...query, orgCode: '' })}
          onChange={e => handleChange({ ...query, id: e.target.value })}
        />

        <TextSearchField
          label="Organisation Code"
          value={query.orgCode}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={e => handleChange({ ...query, orgCode: e.target.value })}
        />

        <LocalesSearchField label="Survey Name" query={query} setQuery={setQuery} handleChange={handleChange} />
      </Box>

      <InspectorResults feedbackTargets={potentialOrganisationSurveys} count={count} />
    </Box>
  )
}

export default OrganisationSurveyInspector
