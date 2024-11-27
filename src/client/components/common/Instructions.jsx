import React, { useState } from 'react'
import { Alert, Box, Collapse, IconButton, Typography } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'

const Instructions = ({ title, alertProps, iconButtonProps, collapseProps, children }) => {
  const [expand, setExpand] = useState(false)

  return (
    <Box my={2}>
      <Alert
        severity="info"
        {...alertProps}
        action={
          <IconButton
            onClick={() => setExpand(!expand)}
            {...iconButtonProps}
            size="small" // Optionally make it smaller for alignment
          >
            {!expand ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        }
      >
        <Typography variant="body2" sx={{ lineHeight: 1.5, margin: 0 }}>
          {title}
        </Typography>

        <Collapse in={expand} timeout="auto" unmountOnExit {...collapseProps} sx={{ mt: 2 }}>
          {children}
        </Collapse>
      </Alert>
    </Box>
  )
}

export default Instructions
