import React from 'react'
import { useLocation, matchPath, Link } from 'react-router-dom'

import { Tab, Tooltip, Badge, Box, Divider, Paper, Typography } from '@mui/material'

const stripSearch = path => path.split('?')[0]

export const TabGroupTab = ({
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
    <Box display="flex" alignItems="center" sx={{ flexShrink: 0 }}>
      {icon}
      <Box ml="0.5rem" />
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
    <Box
      sx={{
        borderBottom: '3px solid',
        py: '0.2rem',
        px: '0.2rem',
        borderColor: active ? 'primary.main' : 'transparent',
        flexShrink: 0,
      }}
    >
      <Tab
        label={content}
        component={Link}
        to={to}
        disabled={disabled}
        {...props}
        sx={theme => ({
          borderRadius: '0.5rem',
          transition: theme.transitions.create('background-color'),
          color: active ? 'primary.main' : 'text.secondary',
          opacity: 1,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        })}
        tabIndex="0"
      />
    </Box>
  )

  if (disabled)
    return (
      <Tooltip title={disabledTooltip} placement="top">
        {tab}
      </Tooltip>
    )
  return tab
}

export const TabGroup = ({ title, hideTitle = false, Icon, children }) => (
  <Box display="flex" sx={{ flexShrink: 0 }}>
    <Box display="flex" flexDirection="column" pt="0.6rem">
      {!hideTitle && (
        <Box display="flex" gap="0.5rem" px="1.5rem" mb="auto" color="textSecondary" alignItems="center">
          {Icon && <Icon sx={theme => ({ color: theme.palette.text.secondary })} />}
          <Typography variant="button" color="textSecondary" sx={{ userSelect: 'none' }} fontSize="small">
            {title}
          </Typography>
        </Box>
      )}
      <Box display="flex" alignItems="end">
        {children}
      </Box>
    </Box>
  </Box>
)

export const TabGroupsContainer = ({ children, showDivider = false }) => {
  const childElements = children.filter(child => Boolean(child))

  return (
    <Box
      mb="2rem"
      sx={{
        '@media print': { display: 'none' },
      }}
    >
      <Box
        sx={{
          borderRadius: '0.8rem',
          boxShadow: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 8 },
        }}
      >
        <Paper>
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="nowrap"
            px="0.2rem"
            alignItems="stretch"
            sx={{
              overflowX: 'auto',
            }}
          >
            {!showDivider && children}
            {showDivider &&
              React.Children.map(childElements, (child, i) => {
                const lastChild = childElements.length === i + 1

                return (
                  <>
                    {child}
                    {lastChild ? null : <Divider orientation="vertical" flexItem />}
                  </>
                )
              })}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
