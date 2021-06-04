import React from 'react'
import { Tooltip, makeStyles } from '@material-ui/core'
import PlusIcon from '@material-ui/icons/Add'
import MinusIcon from '@material-ui/icons/Remove'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles({
  item: {
    textAlign: 'center',
  },
  content: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 2,
  },
  indicator: {
    marginRight: '4px',
  },
  empty: {
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

const getDifferenceIndicator = ({ meanDifference, className }) => {
  if (meanDifference <= -1) {
    return <MinusIcon fontSize="small" className={className} />
  }

  if (meanDifference >= 1) {
    return <PlusIcon fontSize="small" className={className} />
  }

  return null
}

const ResultItem = ({
  mean,
  meanDifference,
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

  const differenceIndicator = getDifferenceIndicator({
    meanDifference,
    className: classes.indicator,
  })

  return (
    <Tooltip title={tooltipTitle}>
      <Component className={className} {...props}>
        <div className={classes.content}>
          {differenceIndicator}
          <span>{mean}</span>
        </div>
      </Component>
    </Tooltip>
  )
}

export default ResultItem
