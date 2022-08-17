import React from 'react'
/** @jsxImportSource @emotion/react */
import { Tooltip } from '@mui/material'
import {
  green,
  lightGreen,
  deepOrange,
  amber,
  grey,
  red,
} from '@mui/material/colors'

const styles = {
  item: {
    textAlign: 'center',
    position: 'relative',
    color: grey['900'],
  },
  missing: {
    backgroundColor: (theme) => theme.palette.divider,
  },
  bad: {
    backgroundColor: red.A400,
  },
  poor: {
    backgroundColor: deepOrange['300'],
  },
  ok: {
    backgroundColor: amber['200'],
  },
  good: {
    backgroundColor: lightGreen['400'],
  },
  excellent: {
    backgroundColor: green['600'],
  },
}

/* Old Norppa colors 
const styles = {
  item: {
    textAlign: 'center',
    position: 'relative',
  },
  missing: {
    backgroundColor: '#f5f5f5',
  },
  bad: {
    backgroundColor: '#f8696b',
  },
  poor: {
    backgroundColor: '#fba275',
  },
  ok: {
    backgroundColor: '#f5e984',
  },
  good: {
    backgroundColor: '#aad381',
  },
  excellent: {
    backgroundColor: '#63be7a',
  },
} */

const MAX = 5.0
const MIN = 1.8 // Below min everything is the "worst" color
const COLORS = [
  '#fe233f',
  '#ff5d4c',
  '#ff8a5c',
  '#ffb86f',
  '#ffe985',
  '#d5d977',
  '#a5c767',
  '#6cb255',
  '#009b40',
]

const getColorIndex = (mean) => {
  if (mean < 1.0) return '#ffffff00' // Case: no data
  // map range MIN-MAX to 0-8
  const index = Math.max(
    0,
    Math.ceil(((mean - MIN) / (MAX - MIN)) * (COLORS.length - 1)),
  )
  return index
}

const ResultItemBase = ({
  children,
  sx,
  tooltipTitle = '',
  component: Component = 'td',
  mean,
  ...props
}) => {
  const style = {
    ...sx,
    ...styles.item,
    backgroundColor: COLORS[getColorIndex(mean)],
  }

  return (
    <Tooltip title={tooltipTitle}>
      <Component css={style} {...props}>
        {children}
      </Component>
    </Tooltip>
  )
}

export default ResultItemBase
