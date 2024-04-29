import React from 'react'
import { Box, Divider, Paper, Typography } from '@mui/material'

export const TabGroup = ({ title, hideTitle = false, Icon, children }) => (
  <Box display="flex">
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

export const TabGroupsContainer = ({ children }) => {
  const childElements = children.filter(child => Boolean(child))

  return (
    <Paper>
      <Box
        display="flex"
        px="0.2rem"
        alignItems="stretch"
        sx={{
          overflowX: 'auto',
          '::-webkit-scrollbar': {
            display: 'none',
          },
          borderRadius: '0.8rem',
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
