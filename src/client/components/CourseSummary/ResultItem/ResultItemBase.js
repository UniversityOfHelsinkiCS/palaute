import React from 'react'
import { Tooltip, makeStyles } from '@mui/material'
import {
  green,
  lightGreen,
  deepOrange,
  amber,
  grey,
  red,
} from '@mui/material/colors'
import cn from 'classnames'

const useStyles = makeStyles((theme) => ({
  item: {
    textAlign: 'center',
    position: 'relative',
    color: grey['900'],
  },
  missing: {
    backgroundColor: theme.palette.divider,
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
}))

/* Old Norppa colors 
const useStyles1 = makeStyles({
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
}) */

const ResultItemBase = ({
  children,
  className: classNameProp,
  tooltipTitle = '',
  component: Component = 'td',
  color = 'missing',
  ...props
}) => {
  const classes = useStyles()
  const className = cn(classNameProp, classes.item, classes[color])

  return (
    <Tooltip title={tooltipTitle}>
      <Component className={className} {...props}>
        {children}
      </Component>
    </Tooltip>
  )
}

export default ResultItemBase
