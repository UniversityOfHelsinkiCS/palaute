import React from 'react'
import { Chip } from '@mui/material'
import { Link } from 'react-router-dom'

const common = {
  '&:hover': {
    borderRadius: '3px',
  },
  transition: (theme) =>
    theme.transitions.create(['border-radius'], {
      easing: 'ease-out',
      duration: '0.2s',
    }),
  cursor: 'pointer',
}

const LinkChip = ({ to, label, sx, ...props }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <Chip
      onClick={undefined}
      label={label}
      sx={[common, sx]}
      variant="outlined"
      size="small"
      href={to}
      {...props}
    />
  </Link>
)

export default LinkChip
