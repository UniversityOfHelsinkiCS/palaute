import { Search, SettingsOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { format, isValid } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { focusIndicatorStyle } from '../../../util/accessibility'

export const OrganisationLink = ({ code, access, dateRange }) => {
  const { t } = useTranslation()
  const { write } = access

  const courseLinkURL = new URL(`/organisations/${code}/${write ? 'settings' : 'summary'}`, 'http://dummy')

  const startDate = dateRange?.start
  const endDate = dateRange?.end
  const [searchParams] = useSearchParams()
  const optionParam = searchParams.get('option')

  if (optionParam) {
    courseLinkURL.searchParams.append('option', optionParam)
  }

  if (isValid(startDate) && isValid(endDate)) {
    courseLinkURL.searchParams.append('startDate', format(startDate, 'yyyy-MM-dd'))
    courseLinkURL.searchParams.append('endDate', format(endDate, 'yyyy-MM-dd'))
  }

  const link = `${courseLinkURL.pathname}${!write ? courseLinkURL.search : ''}`

  if (!access || Object.keys(access).length === 0) return null

  return (
    <Box
      sx={{
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Tooltip
        title={t(write ? 'courseSummary:programmeSettings' : 'courseSummary:programmeSummary')}
        placement="bottom"
      >
        <IconButton
          id={`settings-button-${code}`}
          component={Link}
          to={link}
          size="large"
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            ...focusIndicatorStyle(),
          }}
          disableFocusRipple
        >
          {write ? <SettingsOutlined sx={{ fontSize: '24px' }} /> : <Search sx={{ fontSize: '24px' }} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
