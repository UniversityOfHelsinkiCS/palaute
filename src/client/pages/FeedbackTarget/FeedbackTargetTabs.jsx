import { Tab, Tooltip, Box, Paper, Tabs } from '@mui/material'
import React, { useId, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'

import { handleTabKeyDown } from '../../components/common/utils'

const stripSearch = path => path.split('?')[0]

export const FeedbackTargetTab = ({
  icon,
  label,
  to,
  value,
  disabled,
  disabledTooltip,
  tooltip,
  id,
  onFocus,
  matchPaths: _matchPaths, // Tab containers use this, but it's kept out of the props passed to Tab
  ...props
}) => {
  const descriptionId = useId()
  const tooltipTitle = disabled ? disabledTooltip : tooltip

  const content = icon ? (
    <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
      {icon}
      {label}
    </Box>
  ) : (
    label
  )

  const labelWithDescription = tooltipTitle ? (
    <>
      {content}
      <span id={descriptionId} hidden>
        {tooltipTitle}
      </span>
    </>
  ) : (
    content
  )

  const tab = (
    <Tab
      id={id}
      label={labelWithDescription}
      component={disabled ? 'button' : Link}
      to={disabled ? undefined : to}
      value={value}
      onKeyDown={handleTabKeyDown}
      aria-controls={id ? id.replace('-tab-', '-tabpanel-') : undefined}
      // Overrides the title and aria-describedby that Tooltip would toggle when it opens,
      // so that the description is static and announced exactly once
      title={undefined}
      aria-describedby={tooltipTitle ? descriptionId : undefined}
      onFocus={event => {
        event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        onFocus?.(event)
      }}
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

  if (tooltipTitle) {
    // The tooltip is only visual, screen readers get the same text through aria-describedby
    return (
      <Tooltip title={tooltipTitle} placement="top" describeChild slotProps={{ popper: { 'aria-hidden': true } }}>
        {tab}
      </Tooltip>
    )
  }

  return tab
}

const useSelectedTab = children => {
  const { pathname } = useLocation()
  const path = stripSearch(pathname)

  const validChildren = useMemo(() => React.Children.toArray(children).filter(React.isValidElement), [children])

  return useMemo(() => {
    // A tab that groups inner tabs is selected on the paths of all of them
    const index = validChildren.findIndex(child =>
      (child.props.matchPaths ?? [child.props.to]).map(stripSearch).includes(path)
    )
    const currentValue = index < 0 ? 0 : index

    const childrenWithValue = validChildren.map((child, idx) => React.cloneElement(child, { value: idx }))

    return { currentValue, childrenWithValue }
  }, [validChildren, path])
}

const indicatorStyles = {
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
}

const indicatorSlotProps = { children: <span className="MuiTabs-indicatorSpan" /> }

const scrollButtonStyles = {
  '& .MuiTabs-scrollButtons': {
    width: '28px',
  },
}

export const FeedbackTargetInnerTabsContainer = ({ children, ...props }) => {
  const { currentValue, childrenWithValue } = useSelectedTab(children)

  return (
    <Tabs
      value={currentValue}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', ...indicatorStyles, ...scrollButtonStyles }}
      slotProps={{ indicator: indicatorSlotProps, scroller: { tabIndex: -1 } }}
      {...props}
    >
      {childrenWithValue}
    </Tabs>
  )
}

export const FeedbackTargetTabsContainer = ({ children, ...props }) => {
  const { currentValue, childrenWithValue } = useSelectedTab(children)

  return (
    <Box
      sx={{
        '@media print': { display: 'none' },
        mb: '1rem',
        borderRadius: '0.8rem',
        boxShadow: 2,
      }}
    >
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={currentValue}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            pt: 0.5,
            px: 1,
            '& .MuiTabs-flexContainer': {
              alignItems: 'stretch',
              ml: 0,
            },
            ...indicatorStyles,
            ...scrollButtonStyles,
          }}
          slotProps={{
            indicator: indicatorSlotProps,
            scroller: { tabIndex: -1 },
          }}
          {...props}
        >
          {childrenWithValue}
        </Tabs>
      </Paper>
    </Box>
  )
}
