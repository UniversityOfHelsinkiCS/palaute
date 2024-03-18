import React from 'react'
import { Tabs, Tab, Badge } from '@mui/material'
import { Link } from 'react-router-dom'

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

export const StatusTabs = ({ status, tabOrder, children, ...props }) => {
  const index = tabOrder.indexOf(status)
  const value = index < 0 ? 0 : index

  return (
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      value={value}
      sx={{ my: 3 }}
      {...props}
    >
      {children}
    </Tabs>
  )
}
