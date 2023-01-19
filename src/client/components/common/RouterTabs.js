import React from 'react'
import { useLocation, matchPath, Link } from 'react-router-dom'
import { Tabs, Tab, Box, Tooltip, Badge, Paper } from '@mui/material'

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

export const RouterTab = ({ icon, label, to, disabled, disabledTooltip, badge, ...props }) => {
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
      <Badge color="primary" variant="dot" overlap="rectangular">
        {content}
      </Badge>
    )
  }

  const tab = <Tab label={content} component={Link} to={to} disabled={disabled} {...props} />
  if (disabled)
    return (
      <Tooltip title={disabledTooltip} placement="top">
        <Box>{tab}</Box>
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
