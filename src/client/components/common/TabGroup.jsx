import React from 'react'
import { Box, Divider, Paper, Tabs, Typography } from '@mui/material'

export const TabGroup = ({ title, hideTitle = false, Icon, children }) => (
  <Box display="flex" flexDirection="column" pt="0.6rem">
    {!hideTitle && (
      <Box
        role="region"
        aria-labelledby={`tab-list-${title}`}
        sx={{
          display: 'flex',
          gap: '0.5rem',
          px: '1.5rem',
          my: 'auto',
          alignItems: 'center',
        }}
      >
        {Icon && <Icon aria-hidden="true" sx={theme => ({ color: theme.palette.text.secondary })} />}
        <Typography
          id={`tab-list-${title}`}
          variant="button"
          color="textSecondary"
          sx={{ userSelect: 'none' }}
          fontSize="small"
        >
          {title}
        </Typography>
      </Box>
    )}
    <Box display="flex" alignItems="end">
      {children}
    </Box>
  </Box>
)

export const TabGroupsContainer = ({ children }) => (
  <Paper>
    <Tabs
      variant="scrollable"
      scrollButtons="auto"
      value={false}
      sx={{
        my: 3,
        '& .MuiTabs-indicator': {
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        },
        '& .MuiTabs-indicatorSpan': {
          maxWidth: 80,
          width: '100%',
          backgroundColor: theme => theme.palette.primary.main,
        },
      }}
      TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
    >
      {children}
    </Tabs>
  </Paper>
)
