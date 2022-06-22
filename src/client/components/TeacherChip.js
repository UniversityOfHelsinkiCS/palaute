import { Chip } from '@material-ui/core'
import React from 'react'

const TeacherChip = ({ user, onDelete }) => (
  <Chip
    label={`${user.firstName} ${user.lastName}`}
    onDelete={
      onDelete &&
      ((e) => {
        e?.preventDefault()
        onDelete()
      })
    }
    clickable
    component="a"
    href={`mailto:${user.email}`}
    size="small"
    style={{ margin: '1px' }}
  />
)

export default TeacherChip
