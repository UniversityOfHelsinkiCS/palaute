import { Chip, Tooltip } from '@mui/material'
import React from 'react'

const TeacherChip = ({ user, onDelete, tooltip, outlined = false, style = {}, tooltipPlacement }) => (
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

export default TeacherChip
