import React, { useState } from 'react'

import { Box, Collapse, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const ExpandMore = ({ expand, ...props }) => (
  <IconButton
    sx={{
      position: 'absolute',
      top: -20,
      left: -20,
      zIndex: 10,
      backgroundColor: theme => theme.palette.background.default,
      transform: expand ? 'rotate(0deg)' : 'rotate(-90deg)',
      transition: theme =>
        theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
      '&:hover': {
        backgroundColor: theme => theme.palette.background.default,
      },
    }}
    {...props}
  />
)

const CourseUnitGroupAccordion = ({ courseUnitGroupTitle, children }) => {
  const [expanded, setExpanded] = useState(false)

  const handleExpand = () => setExpanded(!expanded)

  return (
    <Box
      sx={{
        marginTop: '4rem',
        padding: '1rem',
        borderTop: theme => `1px solid ${theme.palette.primary.light}`,
        borderRight: theme => (expanded ? `1px solid ${theme.palette.primary.light}` : ''),
        borderLeft: theme => (expanded ? `1px dashed ${theme.palette.primary.light}` : ''),
        position: 'relative',
        '&:hover': {
          borderColor: theme => theme.palette.primary.dark,
        },
      }}
    >
      {courseUnitGroupTitle}
      <ExpandMore expand={expanded} onClick={handleExpand} aria-expanded={expanded} aria-label="show more">
        <ExpandMoreIcon />
      </ExpandMore>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </Box>
  )
}

export default CourseUnitGroupAccordion
