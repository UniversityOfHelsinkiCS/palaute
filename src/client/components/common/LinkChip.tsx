import type { ChipProps, Theme } from '@mui/material'

import { Chip } from '@mui/material'
import React from 'react'
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

type LinkChipProps = Omit<ChipProps, 'onClick' | 'variant' | 'size'> & {
  to: string
}

const LinkChip = ({ to, sx, ...props }: LinkChipProps) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <Chip onClick={undefined} variant="outlined" size="small" sx={mergeSx(common, sx)} {...props} />
  </Link>
)

export default LinkChip
