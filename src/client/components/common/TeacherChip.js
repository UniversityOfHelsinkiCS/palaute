import { Chip, Tooltip } from '@mui/material'
import React from 'react'

const TeacherChip = ({ user, onDelete, tooltip, outlined = false, style = {} }) => (
  <Tooltip title={tooltip || user.email}>
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
      style={{ margin: '1px', ...style }}
    />
  </Tooltip>
)

export default TeacherChip
