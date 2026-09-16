import type { SxProps, Theme } from '@mui/material'
import type { ReactNode } from 'react'

import { ExpandMore, ExpandLess, InfoOutlined } from '@mui/icons-material'
import { Alert, Box, Typography, Button } from '@mui/material'
import { useState } from 'react'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

const styles = {
  expandIcons: {
    ml: '1rem',
    fontSize: '22px',
    color: '#014361',
  },
}

type InstructionsProps = {
  title: string
  sx?: SxProps<Theme>
  dataCyPrefix?: string
  children: ReactNode
}

const Instructions = ({ title, sx, dataCyPrefix, children }: InstructionsProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box sx={mergeSx(sx, { my: 2 })}>
      <Alert severity="info" icon={false} sx={{ p: 0 }} data-cy={dataCyPrefix ? `${dataCyPrefix}-alert` : undefined}>
        <Button
          sx={{
            display: 'flex',
            alignItems: 'center',
            textTransform: 'none',
            p: '0.5rem',
            mx: '0.4rem',
            ...focusIndicatorStyle(),
          }}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          disableFocusRipple
          data-cy={dataCyPrefix ? `${dataCyPrefix}-expand-button` : undefined}
        >
          <InfoOutlined sx={{ color: '#0288d1', fontSize: '22px' }} aria-hidden="true" />
          <Typography sx={{ fontSize: '0.875rem', color: '#014361', ml: '0.5rem' }}>{title}</Typography>
          {expanded ? <ExpandLess sx={styles.expandIcons} /> : <ExpandMore sx={styles.expandIcons} />}
        </Button>
        {expanded && (
          <Box sx={{ my: 2, mx: 5.5 }} data-cy={dataCyPrefix ? `${dataCyPrefix}-delimeter-list` : undefined}>
            {children}
          </Box>
        )}
      </Alert>
    </Box>
  )
}

export default Instructions
