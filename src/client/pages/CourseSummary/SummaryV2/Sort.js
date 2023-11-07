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

  const isDesc = currentOrderByField === 'desc'
  const isActive = currentSortByField === String(field)
  const isNextDesc = isActive && !isDesc
  const isNextAsc = isActive && isDesc

  return (
    <Box sx={{ display: 'flex', width, justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Tooltip
          title={`${t('common:sort')} ${isNextDesc ? t('common:descending') : t('common:ascending')}: ${label}`}
          placement="top"
        >
          <div>
            <IconButton
              sx={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: '-1rem',
              }}
              onClick={() => setSortBy([field, isActive && isDesc ? 'asc' : 'desc'])}
              size="small"
              color="primary"
            >
              <ArrowDropUp color={isNextAsc ? 'primary' : 'disabled'} />
              <ArrowDropDown color={isNextDesc ? 'primary' : 'disabled'} />
            </IconButton>
          </div>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default Sort
