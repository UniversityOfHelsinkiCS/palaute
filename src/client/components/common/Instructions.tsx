import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Box, Collapse, IconButton, Typography, Tooltip } from '@mui/material'
import type { AlertProps, CollapseProps, IconButtonProps, SxProps, Theme } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type InstructionsProps = {
  title: string
  sx?: SxProps<Theme>
  alertProps?: AlertProps
  iconButtonProps?: IconButtonProps
  collapseProps?: CollapseProps
  children: ReactNode
}

const Instructions = ({ title, sx, alertProps, iconButtonProps, collapseProps, children }: InstructionsProps) => {
  const [expand, setExpand] = useState(false)
  const { t } = useTranslation()
  const rootSlotProps = alertProps?.slotProps?.root
  // slotProps.root can be a function of ownerState per MUI's typing, but this component doesn't
  // support that form, so only merge it when it's the plain object form.
  const rootSlotPropsObject = typeof rootSlotProps === 'function' ? undefined : rootSlotProps

  return (
    <Box sx={mergeSx(sx, { my: 2 })}>
      <Alert
        severity="info"
        slotProps={{ root: { role: undefined, ...rootSlotPropsObject } }}
        {...alertProps}
        action={
          <Tooltip title={expand ? t('common:hide') : t('common:show')}>
            <IconButton
              onClick={() => setExpand(!expand)}
              {...iconButtonProps}
              size="small"
              aria-label={`${title}: ${expand ? t('common:hide') : t('common:show')}`}
              disableFocusRipple
              sx={mergeSx(iconButtonProps?.sx, focusIndicatorStyle())}
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
