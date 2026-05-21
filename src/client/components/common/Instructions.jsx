import React, { useState } from 'react'
import { Alert, Box, Collapse, IconButton, Typography, Tooltip } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { focusIndicatorStyle } from '../../util/accessibility'

const Instructions = ({ title, sx = {}, alertProps, iconButtonProps, collapseProps, children }) => {
  const [expand, setExpand] = useState(false)
  const { t } = useTranslation()

  return (
    <Box sx={{ my: 2, ...sx }}>
      <Alert
        severity="info"
        slotProps={{ root: { role: undefined, ...alertProps?.slotProps?.root } }}
        {...alertProps}
        action={
          <Tooltip title={expand ? t('common:hide') : t('common:show')}>
            <IconButton
              onClick={() => setExpand(!expand)}
              {...iconButtonProps}
              size="small"
              aria-label={`${title}: ${expand ? t('common:hide') : t('common:show')}`}
              disableFocusRipple
              sx={{ ...iconButtonProps?.sx, ...focusIndicatorStyle() }}
            >
              {!expand ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </Tooltip>
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
