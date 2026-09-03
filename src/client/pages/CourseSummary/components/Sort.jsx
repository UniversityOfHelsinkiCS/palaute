import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../../util/accessibility'
import { useSummaryContext } from '../context'

const AngledHeading = ({ id, label, isActive }) => (
  <Tooltip title={label} placement="bottom">
    <Typography
      id={id}
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
  </Tooltip>
)

const Sort = ({ field, label, width }) => {
  const { t } = useTranslation()
  const { sortBy, setSortBy } = useSummaryContext()

  const currentSortByField = sortBy[0]
  const currentOrderByField = sortBy[1]

  const isDesc = currentOrderByField === 'desc'
  const isAsc = currentOrderByField === 'asc'
  const isActive = currentSortByField === field
  const isNextDesc = !isActive || !isDesc

  const labelId = `sort-${field}-label`

  const sortAction = `${t('common:sort')} ${isNextDesc ? t('common:descending') : t('common:ascending')}`
  const sortStatus = isDesc ? t('common:sortedDescending') : t('common:sortedAscending')
  const tooltipTitle = isActive ? `${sortStatus}. ${sortAction}.` : sortAction

  return (
    <Box sx={{ display: 'flex', width, justifyContent: 'center', flexShrink: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // For the vertical headings:
          position: 'relative',
          pt: '10rem',
        }}
      >
        <AngledHeading id={labelId} label={label} isActive={isActive} />
        <Tooltip title={tooltipTitle} placement="bottom">
          <IconButton
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: '1rem',
              ...focusIndicatorStyle(),
            }}
            onClick={() => setSortBy([field, isNextDesc ? 'desc' : 'asc'])}
            color="primary"
            disableRipple
            aria-describedby={labelId}
          >
            <ArrowDropUp color={isActive && isDesc ? 'primary' : 'disabled'} sx={{ m: '-0.5rem' }} />
            <ArrowDropDown color={isActive && isAsc ? 'primary' : 'disabled'} sx={{ m: '-0.5rem' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default Sort
