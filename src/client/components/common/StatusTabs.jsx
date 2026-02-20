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
      label={labelElement}
      component={Link}
      to={{ search: `?status=${status}` }}
      sx={{
        '&:hover': {
          color: theme => theme.palette.primary.light,
          opacity: 1,
        },
        '&.Mui-focusVisible': {
          outline: '3px solid',
          outlineColor: theme => theme.palette.primary.main,
          outlineOffset: '2px',
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
        p: 1,
        '& .MuiTabs-scroller': { overflow: 'visible' },
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
