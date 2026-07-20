import { Chip, Tooltip } from '@mui/material'
import React, { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { User } from '@common/types/user'
import { focusIndicatorStyle } from '../../util/accessibility'

type TeacherChipProps = {
  user: User
  onDelete?: () => void
  tooltip?: string
  outlined?: boolean
  style?: CSSProperties
  tooltipPlacement: 'bottom' | 'top' | 'left' | 'right'
}

const TeacherChip = ({ user, onDelete, tooltip, outlined, style, tooltipPlacement }: TeacherChipProps) => {
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
        sx={{ margin: '1px', ...style, fontWeight: 'normal', ...focusIndicatorStyle() }}
      />
    </Tooltip>
  )
}

export default TeacherChip
