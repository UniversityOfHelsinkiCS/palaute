import React from 'react'
import { useLocation, matchPath, Link } from 'react-router-dom'
import { Tabs, Box, Tooltip, Badge, Paper, Tab } from '@mui/material'

import { get } from 'lodash'

export const RouterTabs = ({ children, ...props }) => {
  const { pathname } = useLocation()

  const activeIndex = React.Children.toArray(children)
    .filter(c => React.isValidElement(c))
    .findIndex(c => !!matchPath(pathname, { path: get(c, 'props.to') }))

  return (
    <Paper>
      <Tabs value={activeIndex < 0 ? 0 : activeIndex} {...props} sx={{ borderRadius: '0.8rem' }}>
        {children}
      </Tabs>
    </Paper>
  )
}

export const RouterTab = ({
  icon,
  label,
  to,
  disabled,
  disabledTooltip,
  badge,
  badgeContent,
  badgeColor = 'primary',
  ...props
}) => {
  const { pathname } = useLocation()
  const active = !!matchPath(pathname, { path: to })

  let content = icon ? (
    <Box display="flex" alignItems="center">
      {icon}
      <Box ml="0.5rem" />
      {label}
    </Box>
  ) : (
    label
  )

  if (badge) {
    content = (
      <Badge
        color={badgeColor}
        variant={badgeContent ? 'standard' : 'dot'}
        overlap="rectangular"
        badgeContent={badgeContent}
      >
        {content}
      </Badge>
    )
  }

  const tab = (
    <Box
      sx={{
        borderBottom: '3px solid',
        py: '0.2rem',
        px: '0.2rem',
        borderColor: active ? 'primary.main' : 'transparent',
      }}
    >
      <Tab
        label={content}
        component={Link}
        to={to}
        disabled={disabled}
        {...props}
        sx={theme => ({
          borderRadius: '0.5rem',
          transition: theme.transitions.create('background-color'),
          color: active ? 'primary.main' : 'text.secondary',
          opacity: 1,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        })}
      />
    </Box>
  )

  if (disabled)
    return (
      <Tooltip title={disabledTooltip} placement="top">
        {tab}
      </Tooltip>
    )
  return tab
}

export const TabLabel = ({ icon, text }) => (
  <Box display="flex" alignItems="center">
    {icon}
    <Box ml="0.5rem" />
    {text}
  </Box>
)
