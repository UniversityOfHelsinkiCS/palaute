import React from 'react'

import { Box, Checkbox, FormControlLabel } from '@mui/material'
import { debounce } from 'lodash-es'

import apiClient from '../../../../util/apiClient'
import useHistoryState from '../../../../hooks/useHistoryState'

import LocalesSearchField from '../../Inspector/LocalesSearchField'
import InspectorResults from '../../Inspector/InspectorResults'
import { parseDates } from '../../Inspector/utils'
import TextSearchField from '../../Inspector/TextSearchField'

const FeedbackTargetInspector = () => {
  const [potentialFeedbackTargets, setPotentialFeedbackTargets] = useHistoryState('potentialFeedbacktargets', [])
  const [count, setCount] = useHistoryState('potentialFeedbackTargetCount', 0)

  const [query, setQuery] = useHistoryState('feedback-target_query', {
    id: '',
    code: '',
    name: '',
    curName: '',
    language: 'fi',
    fbtStatus: '',
    curStatus: '',
  })

  const runQuery = React.useMemo(
    () =>
      debounce(async params => {
        const { data } = await apiClient.get('/admin/feedback-targets', { params })
        const { feedbackTargets, count } = data

        setPotentialFeedbackTargets(parseDates(feedbackTargets))
        setCount(count)
      }, 600),
    [setPotentialFeedbackTargets, setCount]
  )

  React.useEffect(() => () => runQuery.cancel(), [runQuery])

  const hasMinQuery = nextQuery => {
    const idLength = nextQuery.id?.trim().length ?? 0
    const codeLength = nextQuery.code?.trim().length ?? 0
    const nameLength = nextQuery.name?.trim().length ?? 0
    const curNameLength = nextQuery.curName?.trim().length ?? 0
    const hasStatusFilter = !!nextQuery.fbtStatus || !!nextQuery.curStatus

    return idLength > 0 || codeLength > 1 || nameLength > 2 || curNameLength > 2 || hasStatusFilter
  }

  const handleChange = values => {
    const newQuery = { ...query, ...values }
    setQuery(newQuery)
    if (!hasMinQuery(newQuery)) {
      runQuery.cancel()
      setPotentialFeedbackTargets([])
      setCount(0)
      return
    }
    runQuery(newQuery)
  }

  return (
    <Box mt={4}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TextSearchField label="ID" value={query.id} onChange={e => handleChange({ ...query, id: e.target.value })} />

          <TextSearchField
            label="Course Code"
            value={query.code}
            onFocus={() => setQuery({ ...query, id: '' })}
            onChange={e => handleChange({ ...query, code: e.target.value })}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 1, gap: 2 }}>
          <LocalesSearchField
            label="CU Name"
            query={query}
            setQuery={setQuery}
            handleChange={handleChange}
            queryKey="name"
          />

          <LocalesSearchField
            label="CUR Name"
            query={query}
            setQuery={setQuery}
            handleChange={handleChange}
            queryKey="curName"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 4, mx: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={query.fbtStatus === 'open'}
                onChange={e => handleChange({ fbtStatus: e.target.checked ? 'open' : '' })}
              />
            }
            label="Feedback open now"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={query.curStatus === 'ongoing'}
                onChange={e => handleChange({ curStatus: e.target.checked ? 'ongoing' : '' })}
              />
            }
            label="CUR in progress now"
          />
        </Box>
      </Box>

      <InspectorResults feedbackTargets={potentialFeedbackTargets} count={count} />
    </Box>
  )
}

export default FeedbackTargetInspector
