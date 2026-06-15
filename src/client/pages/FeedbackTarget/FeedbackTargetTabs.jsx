import React, { useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'

import { Tab, Tooltip, Box, Paper, Tabs } from '@mui/material'

const stripSearch = path => path.split('?')[0]

export const FeedbackTargetTab = ({ icon, label, to, value, disabled, disabledTooltip, id, ...props }) => {
  const content = icon ? (
    <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
      {icon}
      {label}
    </Box>
  ) : (
    label
  )

  const handleKeyDown = e => {
    if (e.key === ' ') {
      e.preventDefault()
      e.currentTarget.click()
    }
  }

  const tab = (
    <Tab
      id={id}
      label={content}
      component={disabled ? 'button' : Link}
      to={disabled ? undefined : to}
      value={value}
      onKeyDown={handleKeyDown}
      aria-controls={id ? id.replace('-tab-', '-tabpanel-') : undefined}
      sx={theme => ({
        borderRadius: '0.6rem',
        transition: theme.transitions.create('background-color'),
        opacity: 1,
        p: '16px',
        color: theme => (disabled ? theme.palette.text.disabled : undefined),
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover': {
          backgroundColor: disabled ? 'transparent' : theme => theme.palette.action.hover,
        },
        '&.Mui-focusVisible': {
          border: '3px solid',
          borderColor: theme => (disabled ? theme.palette.text.disabled : theme.palette.primary.main),
          p: '13px',
        },
      })}
      disableRipple
      {...props}
    />
  )

  if (disabled && disabledTooltip) {
    return (
      <Tooltip title={disabledTooltip} placement="top" disableFocusListener={false}>
        {tab}
      </Tooltip>
    )
  }

  return tab
}

export const FeedbackTargetTabsContainer = ({ children }) => {
  const { pathname } = useLocation()
  const path = stripSearch(pathname)

  const validChildren = useMemo(() => React.Children.toArray(children).filter(React.isValidElement), [children])

  const { currentValue, childrenWithValue } = useMemo(() => {
    const tabOrder = validChildren.map(child => stripSearch(child.props.to))
    const index = tabOrder.indexOf(path)
    const currentValue = index < 0 ? 0 : index

    const childrenWithValue = validChildren.map((child, idx) => React.cloneElement(child, { value: idx }))

    return { currentValue, childrenWithValue }
  }, [validChildren, path])

  return (
    <Box
      sx={{
        '@media print': { display: 'none' },
        mb: '2rem',
        borderRadius: '0.8rem',
        boxShadow: 2,
      }}
    >
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={currentValue}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          sx={{
            px: 0.1,
            '& .MuiTabs-flexContainer': {
              alignItems: 'stretch',
              ml: 0,
            },
            '& .MuiTabs-indicatorSpan': {
              mt: '-0.25rem',
              mb: '0.05rem',
              width: '86%',
              backgroundColor: theme => theme.palette.primary.main,
              transition: 'none',
            },
            '& .MuiTabs-indicator': {
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              transition: 'none',
            },
            '& .MuiTabs-scrollButtons.Mui-disabled': {
              display: 'none',
              width: 0,
            },
          }}
          slotProps={{
            indicator: { children: <span className="MuiTabs-indicatorSpan" /> },
          }}
        >
          {childrenWithValue}
        </Tabs>
      </Paper>
    </Box>
  )
}
