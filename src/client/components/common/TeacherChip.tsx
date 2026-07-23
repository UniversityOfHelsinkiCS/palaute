import type { User } from '@common/types/user'
import type { SxProps, Theme } from '@mui/material'

import { Chip, Tooltip } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type TeacherChipProps = {
  user: User
  onDelete?: () => void
  tooltip?: string
  outlined?: boolean
  sx?: SxProps<Theme>
  tooltipPlacement: 'bottom' | 'top' | 'left' | 'right'
}

const TeacherChip = ({ user, onDelete, tooltip, outlined, sx, tooltipPlacement }: TeacherChipProps) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={tooltip || user.email} placement={tooltipPlacement}>
      <Chip
        variant={outlined ? 'outlined' : 'filled'}
        label={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
        aria-label={`${tooltip ?? ''} ${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
        aria-description={user.email !== null ? t('common:contactEmailDescription', { email: user.email }) : undefined}
        onDelete={
          onDelete &&
          (e => {
            e?.preventDefault()
            onDelete()
          })
        }
        clickable={user.email !== null}
        component="a"
        href={user.email ? `mailto:${user.email}` : undefined}
        size="small"
        sx={mergeSx({ margin: '1px', fontWeight: 'normal' }, sx, focusIndicatorStyle())}
      />
    </Tooltip>
  )
}

export default TeacherChip
