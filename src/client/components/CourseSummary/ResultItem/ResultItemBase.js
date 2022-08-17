import React from 'react'
/** @jsxImportSource @emotion/react */
import { Tooltip } from '@mui/material'
import { grey } from '@mui/material/colors'

const styles = {
  item: {
    textAlign: 'center',
    position: 'relative',
    color: grey['900'],
  },
}

const MAX = 4.5
const MIN = 2.0 // Below min everything is the "worst" color
const COLORS = [
  '#c9586f',
  '#e66067',
  '#f57368',
  '#fb8c6e',
  '#fba678',
  '#dbda7d',
  '#9ec27c',
  '#60a866',
  '#008c59',
]

const getColorIndex = (mean) => {
  if (mean < 1.0) return -1 // Case: no data
  if (mean < MIN) return 0 // Case: bad
  if (mean >= MAX) return COLORS.length - 1 // Case: awesome

  // map range MIN-MAX to 0-8
  const index = Math.ceil(((mean - MIN) / (MAX - MIN)) * (COLORS.length - 2))
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
