import React from 'react'
import { Tooltip, makeStyles } from '@material-ui/core'
import cn from 'classnames'

const useStyles = makeStyles({
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
})

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
