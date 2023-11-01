import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Tooltip } from '@mui/material'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { useSummaryContext } from './context'

const Sort = ({ field, label, width }) => {
  const { t } = useTranslation()
  const { sortBy, setSortBy } = useSummaryContext()

  const currentSortByField = String(sortBy[0])
  const currentOrderByField = String(sortBy[1])

  return (
    <Box sx={{ display: 'flex', width, justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Tooltip title={`${label}, ${t('common:descending')}`} placement="top">
          <div>
            <IconButton
              onClick={() => setSortBy([field, 'desc'])}
              disabled={currentSortByField === String(field) && currentOrderByField === 'desc'}
              size="small"
              color="primary"
              disableRipple
            >
              <ArrowDropUp />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title={`${label}, ${t('common:ascending')}`} placement="bottom">
          <div>
            <IconButton
              onClick={() => setSortBy([field, 'asc'])}
              disabled={currentSortByField === String(field) && currentOrderByField === 'asc'}
              size="small"
              color="primary"
              disableRipple
            >
              <ArrowDropDown />
            </IconButton>
          </div>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default Sort
