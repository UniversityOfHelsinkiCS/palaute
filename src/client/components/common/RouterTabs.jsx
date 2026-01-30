import React from 'react'
import { useLocation, matchPath, Link } from 'react-router-dom'
import { Tabs, Box, Tooltip, Badge, Tab } from '@mui/material'

import { get } from 'lodash-es'

const stripSearch = path => path.split('?')[0]

export const RouterTabs = ({ children, ...props }) => {
  const { pathname } = useLocation()

  const activeIndex = React.Children.toArray(children)
    .filter(c => React.isValidElement(c))
    .findIndex(c => !!matchPath({ path: stripSearch(get(c, 'props.to')) }, pathname))

  return (
    <Tabs
      value={activeIndex < 0 ? 0 : activeIndex}
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
      {...props}
      TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
    >
      {children}
    </Tabs>
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
  badgeVisible = true,
  ...props
}) => {
  const { pathname } = useLocation()
  const active = !!matchPath({ path: stripSearch(to) }, pathname)

  let content = icon ? (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {icon}
      {label}
    </Box>
  ) : (
    label
  )

  if (badge && badgeVisible) {
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
    <Tab
      label={content}
      component={Link}
      to={to}
      disabled={disabled}
      {...props}
      sx={theme => ({
        padding: '0.5rem 1rem',
        transition: theme.transitions.create('background-color'),
        color: active ? 'primary.main' : 'text.secondary',
        opacity: 1,
        '&:hover': {
          color: theme => theme.palette.primary.light,
          opacity: 1,
        },
        '&.Mui-focusVisible': {
          color: theme => theme.palette.primary.dark,
        },
      })}
      tabIndex="0"
    />
  )

  if (disabled)
    return (
      <Tooltip title={disabledTooltip} placement="top">
        {tab}
      </Tooltip>
    )
  return tab
}
