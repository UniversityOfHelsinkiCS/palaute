import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { useSummaryContext } from './context'

const AngledHeading = ({ label, isActive }) => (
  <Typography
    color={isActive ? 'text.primary' : 'text.secondary'}
    sx={{
      position: 'absolute',
      transform: 'translate(0.7rem, 0rem) translate(-50%, -50%) rotate(-40deg) translate(50%, 50%)',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: '0.7rem',
      maxWidth: '14rem',
      overflow: 'hidden',
    }}
  >
    {label}
  </Typography>
)

const Sort = ({ field, label, width }) => {
  const { t } = useTranslation()
  const { sortBy, setSortBy } = useSummaryContext()

  const currentSortByField = String(sortBy[0])
  const currentOrderByField = String(sortBy[1])

  const isDesc = currentOrderByField === 'desc'
  const isAsc = currentOrderByField === 'asc'
  const isActive = currentSortByField === String(field)
  const isNextDesc = !isActive || !isDesc

  return (
    <Box sx={{ display: 'flex', width, justifyContent: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // For the vertical headings:
          position: 'relative',
          pt: '10rem',
        }}
      >
        <AngledHeading label={label} isActive={isActive} />
        <Tooltip
          title={`${t('common:sort')} ${isNextDesc ? t('common:descending') : t('common:ascending')}`}
          placement="bottom"
        >
          <div>
            <IconButton
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: '1rem',
              }}
              onClick={() => setSortBy([field, isNextDesc ? 'desc' : 'asc'])}
              color="primary"
            >
              <ArrowDropUp color={isActive && isDesc ? 'primary' : 'disabled'} sx={{ m: '-0.5rem' }} />
              <ArrowDropDown color={isActive && isAsc ? 'primary' : 'disabled'} sx={{ m: '-0.5rem' }} />
            </IconButton>
          </div>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default Sort
