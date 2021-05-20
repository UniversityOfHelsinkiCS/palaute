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
    backgroundColor: '#f08683',
  },
  neutral: {
    backgroundColor: '#fffeba',
  },
  good: {
    backgroundColor: '#b2fba7',
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
    mean && mean >= 2 && mean < 4 && classes.neutral,
    mean && mean >= 4 && classes.good,
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
