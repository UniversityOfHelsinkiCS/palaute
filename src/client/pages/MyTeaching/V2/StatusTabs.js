import React from 'react'
import { Tabs, Tab, Badge } from '@mui/material'
import { Link } from 'react-router-dom'

const tabOrder = ['ongoing', 'upcoming', 'ended']

export const StatusTab = ({ status, count, color, label, ...props }) => (
  <Tab
    aria-label={label}
    label={
      <Badge
        aria-hidden
        sx={{
          '& .MuiBadge-badge': {
            right: -5,
            top: -5,
            padding: '0 4px',
          },
        }}
        badgeContent={count}
        color={color}
      >
        {label}
      </Badge>
    }
    component={Link}
    to={{ search: `?status=${status}` }}
    {...props}
  />
)

export const StatusTabs = ({ status, children, ...props }) => {
  if (!tabOrder.includes('ongoing')) tabOrder.unshift('ongoing')

  const index = tabOrder.indexOf(status)
  const value = index < 0 ? 0 : index

  return (
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      value={value}
      {...props}
    >
      {children}
    </Tabs>
  )
}
