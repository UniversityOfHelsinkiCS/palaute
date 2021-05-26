import React from 'react'
import { Tooltip, makeStyles } from '@material-ui/core'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles({
  item: {
    textAlign: 'center',
  },
  empty: {
    backgroundColor: '#f5f5f5',
  },
  bad: {
    backgroundColor: '#ea736b',
  },
  poor: {
    backgroundColor: '#eebb84',
  },
  ok: {
    backgroundColor: '#f4eb91',
  },
  good: {
    backgroundColor: '#a4ce83',
  },
  excellent: {
    backgroundColor: '#7abc84',
  },
})

const ResultItem = ({
  mean,
  questionLabel,
  className: classNameProp,
  component: Component = 'td',
  ...props
}) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const className = cn(
    classNameProp,
    classes.item,
    mean === null && classes.empty,
    mean && mean < 2 && classes.bad,
    mean && mean >= 2 && mean < 2.5 && classes.poor,
    mean && mean >= 2.5 && mean < 3.5 && classes.ok,
    mean && mean >= 3.5 && mean < 4.5 && classes.good,
    mean && mean >= 4.5 && classes.excellent,
  )

  const tooltipTitle = `${questionLabel}: ${
    mean === null ? t('courseSummary:noResults') : mean
  }`

  return (
    <Tooltip title={tooltipTitle}>
      <Component className={className} {...props}>
        {mean}
      </Component>
    </Tooltip>
  )
}

export default ResultItem
