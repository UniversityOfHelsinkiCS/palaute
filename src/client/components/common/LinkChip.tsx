import React from 'react'
import { Chip } from '@mui/material'
import type { ChipProps, Theme } from '@mui/material'
import { Link } from 'react-router-dom'
import { mergeSx } from '../../util/sx'

const common = {
  '&:hover': {
    borderRadius: '3px',
  },
  transition: (theme: Theme) =>
    theme.transitions.create(['border-radius'], {
      easing: 'ease-out',
      duration: '0.2s',
    }),
  cursor: 'pointer',
}

interface LinkChipProps extends Omit<ChipProps, 'onClick' | 'variant' | 'size'> {
  to: string
}

const LinkChip = ({ to, sx, ...props }: LinkChipProps) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <Chip onClick={undefined} variant="outlined" size="small" sx={mergeSx(common, sx)} {...props} />
  </Link>
)

export default LinkChip
