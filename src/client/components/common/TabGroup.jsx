import React from 'react'
import { Box, Divider, Paper, Tabs, Typography } from '@mui/material'

export const TabGroup = ({ title, hideTitle = false, Icon, children }) => (
  <Box display="flex" flexDirection="column" pt="0.6rem">
    {!hideTitle && (
      <Box
        sx={{
          display: 'flex',
          gap: '0.5rem',
          px: '1.5rem',
          my: 'auto',
          alignItems: 'center',
        }}
      >
        {Icon && <Icon aria-hidden="true" sx={theme => ({ color: theme.palette.text.secondary })} />}
        <Typography
          id={`tab-list-${title}`}
          variant="button"
          color="textSecondary"
          sx={{ userSelect: 'none' }}
          fontSize="small"
        >
          {title}
        </Typography>
      </Box>
    )}
    <Tabs aria-labelledby={`tab-list-${title}`} sx={{ display: 'flex', alignItems: 'end' }}>
      {children}
    </Tabs>
  </Box>
)

export const TabGroupsContainer = ({ children }) => {
  const childElements = children.filter(child => Boolean(child))

  return (
    <Paper sx={{ px: '0.5rem' }}>
      <Box
        display="flex"
        alignItems="stretch"
        sx={{
          overflowX: 'auto',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {React.Children.map(childElements, (child, i) => {
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
  )
}
