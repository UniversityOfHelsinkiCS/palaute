import React from 'react'
import { Tabs, Tab, Badge, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'

export const StatusTab = ({ status, count, countLabel, badgeColor, label, ...props }) => {
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
      badgeContent={
        <Tooltip data-cy="status-tab-badge-tooltip" title={countLabel} placement="top" arrow>
          <span>{count}</span>
        </Tooltip>
      }
      color={badgeColor}
    >
      {label}
    </Badge>
  ) : (
    label
  )

  return (
    <Tab
      label={labelElement}
      component={Link}
      to={{ search: `?status=${status}` }}
      sx={{
        '&:hover': {
          color: theme => theme.palette.primary.light,
          opacity: 1,
        },
        '&.Mui-focusVisible': {
          color: theme => theme.palette.primary.dark,
        },
      }}
      {...props}
    />
  )
}

export const StatusTabs = ({ status, tabOrder, children, ...props }) => {
  const index = tabOrder.indexOf(status)
  const value = index < 0 ? 0 : index

  return (
    <Tabs
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      value={value}
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
