import React from 'react'

import { Box, Button, TextField, Typography } from '@mui/material'
import { debounce } from 'lodash'

import apiClient from '../../util/apiClient'
import useHistoryState from '../../hooks/useHistoryState'
import FeedbackTargetItem from './FeedbackTargetItem'

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
      <Box display="flex" alignItems="center">
        <TextField
          variant="outlined"
          label="id"
          value={query.id}
          onChange={e => handleChange({ ...query, id: e.target.value })}
        />
        <Box m={1} />
        <TextField
          variant="outlined"
          label="course code"
          value={query.code}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={e => handleChange({ ...query, code: e.target.value })}
        />
        <Box m={1} />
        <TextField
          variant="outlined"
          label="CU name"
          value={query.name}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={e => handleChange({ ...query, name: e.target.value })}
        />
        <Box m={1} />
        <Button
          onClick={() => {
            const newQuery = {
              ...query,
              language: query.language === 'fi' ? 'en' : 'fi',
            }
            setQuery(newQuery)
            if (query.name?.length > 2) {
              runQuery(newQuery)
            }
          }}
        >
          {query.language === 'fi' ? 'finnish' : 'english'}
        </Button>
      </Box>
      <Box m={2} />
      <Typography>
        Showing {potentialFeedbackTargets.length}/{count} results
      </Typography>
      <Box m={2} />
      {potentialFeedbackTargets.map(feedbackTarget => (
        <FeedbackTargetItem key={feedbackTarget.id} feedbackTarget={feedbackTarget} />
      ))}
    </Box>
  )
}

export default FeedbackTargetInspector
