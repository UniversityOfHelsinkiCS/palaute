import { Chip, Tooltip } from '@mui/material'
import React, { CSSProperties } from 'react'
import { User } from '../../types/User'

interface TeacherChipProps {
  user: User
  onDelete?: () => void
  tooltip?: string
  outlined?: boolean
  style?: CSSProperties
  tooltipPlacement: 'bottom' | 'top' | 'left' | 'right'
}

const TeacherChip: React.FC<TeacherChipProps> = ({ user, onDelete, tooltip, outlined, style, tooltipPlacement }) => (
  <Tooltip title={tooltip || user.email} placement={tooltipPlacement}>
    <Chip
      variant={outlined ? 'outlined' : 'filled'}
      label={`${user.firstName ?? ''} ${user.lastName ?? ''}`}
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
      sx={{ margin: '1px', ...style, fontWeight: 'normal' }}
    />
  </Tooltip>
)

TeacherChip.defaultProps = {
  onDelete: undefined,
  tooltip: undefined,
  outlined: false,
  style: {},
}

export default TeacherChip
