import React, { Children, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

const ExpandableCourseUnitGroup = ({ children }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const [courseUnitGroupTitle, ...courseUnitGroupContent] = Children.toArray(children)

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
      <Box
        sx={{
          '&:hover': {
            cursor: 'pointer',
          },
        }}
        onClick={handleExpand}
      >
        {courseUnitGroupTitle}
        <ExpandMore expand={expanded} aria-expanded={expanded} aria-label={t('teacherView:expandMoreLabel')}>
          <ExpandMoreIcon />
        </ExpandMore>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {courseUnitGroupContent}
      </Collapse>
    </Box>
  )
}

export default ExpandableCourseUnitGroup
