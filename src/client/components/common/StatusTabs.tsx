import React from 'react'
import type { ReactNode } from 'react'
import { Tabs, Tab, Badge, Tooltip } from '@mui/material'
import type { TabsProps, TabProps } from '@mui/material'
import { Link } from 'react-router-dom'
import { handleTabKeyDown } from './utils'

type StatusTabProps = Omit<TabProps, 'label'> & {
  status: string
  count?: number
  countLabel?: ReactNode
  badgeColor?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning'
  label: ReactNode
}

export const StatusTab = ({ status, count, countLabel, badgeColor, label, ...props }: StatusTabProps) => {
  const labelElement = count ? (
    <Badge
      data-cy="status-tab-badge"
      sx={{
        '& .MuiBadge-badge': {
          right: -5,
          top: -5,
          padding: '0 4px',
        },
      }}
      badgeContent={count}
      color={badgeColor}
    >
      {label}
    </Badge>
  ) : (
    label
  )

  const tabElement = (
    <Tab
      id={`tab-${status}`}
      aria-controls={`tabpanel-${status}`}
      label={labelElement}
      component={Link}
      to={{ search: `?status=${status}` }}
      onKeyDown={handleTabKeyDown}
      sx={{
        p: '15px',
        pt: '21px',
        pr: '21px',
        '&:hover': {
          color: theme => theme.palette.primary.light,
          opacity: 1,
        },
        '&.Mui-focusVisible': {
          border: '3px solid',
          borderColor: theme => theme.palette.primary.main,
          p: '12px',
          pt: '18px',
          pr: '18px',
        },
      }}
      disableRipple
      {...props}
    />
  )

  if (count) {
    return (
      <Tooltip data-cy="status-tab-badge-tooltip" title={`${label}: ${countLabel}`} placement="top" arrow describeChild>
        {tabElement}
      </Tooltip>
    )
  }

  return tabElement
}

type StatusTabsProps = TabsProps & {
  status: string
  tabOrder: string[]
  children: ReactNode
}

export const StatusTabs = ({ status, tabOrder, children, ...props }: StatusTabsProps) => {
  const index = tabOrder.indexOf(status)
  const value = index < 0 ? 0 : index

  return (
    <Tabs
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      value={value}
      sx={{
        my: 3,
        '& .MuiTabs-indicator': {
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        },
        '& .MuiTabs-indicatorSpan': {
          my: '-3px',
          width: '96%',
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
