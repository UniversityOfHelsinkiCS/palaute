import { Chip } from '@mui/material'
import React from 'react'

const TeacherChip = ({ user, onDelete }) => (
  <Chip
    label={`${user.firstName ?? ''} ${user.lastName ?? ''}`}
    onDelete={
      onDelete &&
      ((e) => {
        e?.preventDefault()
        onDelete()
      })
    }
    clickable={user.email !== null}
    component="a"
    href={user.email ? `mailto:${user.email}` : undefined}
    size="small"
    style={{ margin: '1px' }}
  />
)

export default TeacherChip
