import React from 'react'

import { Box, TextField, Typography } from '@mui/material'
import { debounce } from 'lodash'

import apiClient from '../../../../util/apiClient'
import useHistoryState from '../../../../hooks/useHistoryState'
import FeedbackTargetItem from '../../Inspector/FeedbackTargetItem'
import LocalesSearchField from '../../Inspector/LocalesSearchField'

const FeedbackTargetInspector = () => {
  const [potentialFeedbackTargets, setPotentialFeedbackTargets] = useHistoryState('potentialFeedbacktargets', [])
  const [count, setCount] = useHistoryState('potentialFeedbackTargetCount', 0)

  const [query, setQuery] = useHistoryState('feedback-target_query', {
    id: '',
    code: '',
    name: '',
    language: 'fi',
  })

  const runQuery = debounce(async params => {
    const { data } = await apiClient.get('/admin/feedback-targets', { params })
    const { feedbackTargets, count } = data

    setPotentialFeedbackTargets(
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
          label="Course Code"
          value={query.code}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={e => handleChange({ ...query, code: e.target.value })}
        />

        <LocalesSearchField
          label="CU Name"
          query={query}
          setQuery={setQuery}
          runQuery={runQuery}
          handleChange={handleChange}
        />
      </Box>

      <Typography sx={{ m: 2 }}>
        Showing {potentialFeedbackTargets.length}/{count} results
      </Typography>

      {potentialFeedbackTargets.map(feedbackTarget => (
        <FeedbackTargetItem key={feedbackTarget.id} feedbackTarget={feedbackTarget} />
      ))}
    </Box>
  )
}

export default FeedbackTargetInspector
