import React from 'react'
import { Box, IconButton } from '@mui/material'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { useSummaryContext } from './context'

const Sort = ({ field, label, width }) => {
  const { sortBy, setSortBy } = useSummaryContext()

  const currentSortByField = String(sortBy[0])
  const currentOrderByField = String(sortBy[1])

  return (
    <Box sx={{ display: 'flex', width, justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton
          onClick={() => setSortBy([field, 'asc'])}
          disabled={currentSortByField === String(field) && currentOrderByField === 'asc'}
          size="small"
          color="primary"
        >
          <ArrowDropUp />
        </IconButton>
        <IconButton
          onClick={() => setSortBy([field, 'desc'])}
          disabled={currentSortByField === String(field) && currentOrderByField === 'desc'}
          size="small"
          color="primary"
        >
          <ArrowDropDown />
        </IconButton>
      </Box>
    </Box>
  )
}

export default Sort
