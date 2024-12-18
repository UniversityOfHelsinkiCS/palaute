import React from 'react'
import { Search, SettingsOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const OrganisationLink = ({ code, access }) => {
  const { t } = useTranslation()

  if (!access || Object.keys(access).length === 0) return null
  const { write } = access

  return (
    <Box
      sx={{
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Tooltip title={t(write ? 'courseSummary:programmeSettings' : 'courseSummary:programmeSummary')} placement="top">
        <IconButton
          id={`settings-button-${code}`}
          component={Link}
          to={`/organisations/${code}/${write ? 'settings' : 'summary'}`}
          size="large"
          sx={{
            '&:hover': {
              color: theme => theme.palette.primary.light,
              background: 'transparent',
            },
          }}
          color="primary"
          disableFocusRipple
        >
          {write ? <SettingsOutlined sx={{ fontSize: '26px' }} /> : <Search sx={{ fontSize: '24px' }} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
