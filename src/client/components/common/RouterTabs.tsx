import React from 'react'
import type { ReactNode } from 'react'
import { useLocation, matchPath, Link } from 'react-router-dom'
import { Tabs, Box, Tooltip, Badge, Tab } from '@mui/material'
import type { TabsProps, TabProps } from '@mui/material'

import { handleTabKeyDown } from './utils'

const stripSearch = (path: string) => path.split('?')[0]

type RouterTabsProps = TabsProps & {
  children: ReactNode
}

export const RouterTabs = ({ children, ...props }: RouterTabsProps) => {
  const { pathname } = useLocation()

  const activeIndex = React.Children.toArray(children)
    .filter((c): c is React.ReactElement<{ to?: string }> => React.isValidElement(c))
    .findIndex(c => !!matchPath({ path: stripSearch(c.props.to ?? '') }, pathname))

  return (
    <Tabs
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      value={activeIndex < 0 ? 0 : activeIndex}
      sx={{
        my: 3,
        '& .MuiTabs-indicator': {
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        },
        '& .MuiTabs-indicatorSpan': {
          my: '-3px',
          width: '98%',
          backgroundColor: theme => theme.palette.primary.main,
        },
      }}
      {...props}
      slotProps={{
        indicator: { children: <span className="MuiTabs-indicatorSpan" /> },
      }}
    >
      {children}
    </Tabs>
  )
}

type RouterTabProps = Omit<TabProps, 'label'> & {
  label: ReactNode
  to: string
  disabled?: boolean
  disabledTooltip?: ReactNode
  badge?: boolean
  badgeContent?: ReactNode
  badgeColor?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning'
  badgeVisible?: boolean
  tabId?: string
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
  tabId,
  ...props
}: RouterTabProps) => {
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
      id={`tab-${tabId}`}
      aria-controls={`tabpanel-${tabId}`}
      label={content}
      component={Link}
      to={to}
      disabled={disabled}
      onKeyDown={handleTabKeyDown}
      {...props}
      sx={theme => ({
        padding: '15px',
        transition: theme.transitions.create('background-color'),
        color: active ? 'primary.main' : 'text.secondary',
        opacity: 1,
        '&:hover': {
          color: theme.palette.primary.light,
          opacity: 1,
        },
        '&.Mui-focusVisible': {
          padding: '12px',
          border: '3px solid',
          borderColor: theme.palette.primary.main,
          outlineOffset: '3px',
        },
      })}
      disableRipple
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
