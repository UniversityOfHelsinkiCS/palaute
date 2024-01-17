import React from 'react'

import { Box, Select, MenuItem, TextField, Typography } from '@mui/material'
import { debounce } from 'lodash'

import apiClient from '../../../../util/apiClient'
import useHistoryState from '../../../../hooks/useHistoryState'
import FeedbackTargetItem from '../../Inspector/FeedbackTargetItem'

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

    setPotentialOrganisationSurveys(
      feedbackTargets.map(fbt => ({
        ...fbt,
        opensAt: new Date(fbt.opensAt),
        closesAt: new Date(fbt.closesAt),
        courseRealisation: {
          ...fbt.courseRealisation,
          startDate: new Date(fbt.courseRealisation.startDate),
          endDate: new Date(fbt.courseRealisation.endDate),
        },
      }))
    )
    setCount(count)
  }, 600)

  const handleChange = values => {
    const newQuery = { ...query, ...values }
    setQuery(newQuery)
    runQuery(newQuery)
  }

  return (
    <Box mt={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
        <TextField
          sx={{ m: 1, width: '100%' }}
          variant="outlined"
          label="ID"
          value={query.id}
          onChange={e => handleChange({ ...query, id: e.target.value })}
        />

        <TextField
          sx={{ m: 1, width: '100%' }}
          variant="outlined"
          label="Organisation Code"
          value={query.orgCode}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={e => handleChange({ ...query, orgCode: e.target.value })}
        />

        <Box sx={{ width: '100%', position: 'relative' }}>
          <TextField
            fullWidth
            label="Survey Name"
            value={query.name}
            onFocus={() => setQuery({ ...query, id: '' })}
            onChange={e => handleChange({ ...query, name: e.target.value })}
            InputProps={{ sx: { pr: '64px' } }}
          />
          <Select
            variant="standard"
            disableUnderline
            value={query.language}
            onChange={event => {
              const newQuery = {
                ...query,
                language: event.target.value,
              }
              setQuery(newQuery)
              if (query.name?.length > 2) {
                runQuery(newQuery)
              }
            }}
            sx={{
              position: 'absolute',
              right: '8px',
              top: '12px',
              paddingLeft: '8px',
              borderLeft: '2px solid rgba(0, 0, 0, 0.23)',
            }}
          >
            <MenuItem value="fi">FI</MenuItem>
            <MenuItem value="en">EN</MenuItem>
          </Select>
        </Box>
      </Box>

      <Typography sx={{ m: 2 }}>
        Showing {potentialOrganisationSurveys.length}/{count} results
      </Typography>

      {potentialOrganisationSurveys.map(feedbackTarget => (
        <FeedbackTargetItem key={feedbackTarget.id} feedbackTarget={feedbackTarget} />
      ))}
    </Box>
  )
}

export default OrganisationSurveyInspector
