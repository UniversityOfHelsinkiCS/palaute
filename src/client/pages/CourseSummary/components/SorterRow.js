import React from 'react'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from '../context'
import { YearSemesterSelector } from '../../../components/common/YearSemesterSelector'
import Sort from './Sort'
import { getLanguageValue } from '../../../util/languageUtils'
import RowHeader from './RowHeader'

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
    aspectRatio: 1, // Make them square
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    flexShrink: 0,
    width: '7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentCell: {
    whiteSpace: 'nowrap',
    textAlign: 'right',
    width: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  accordionButton: {
    width: '22rem',
    flexShrink: 0,
    minHeight: '48px',
    maxHeight: '74px',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
    '&:hover': {
      background: theme => theme.palette.action.hover,
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    transition: 'background-color 0.15s ease-out',
  },
  unclickableLabel: {
    width: '22rem',
    flexShrink: 0,
    minHeight: '48px',
    maxHeight: '74px',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
  },
  link: {
    color: theme => theme.palette.primary.main,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: '0.7rem',
    '&:hover': {
      color: theme => theme.palette.text.primary,
    },
    color: theme => theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
  given: {
    color: theme => theme.palette.success.main,
    '&:hover': {
      color: theme => theme.palette.success.light,
    },
  },
  notGiven: {
    color: theme => theme.palette.error.main,
    '&:hover': {
      color: theme => theme.palette.error.light,
    },
  },
  feedbackOpen: {
    color: theme => theme.palette.primary.main,
    '&:hover': {
      color: theme => theme.palette.primary.light,
    },
  },
}

const SorterRow = () => {
  const { t, i18n } = useTranslation()
  const { dateRange, setDateRange, option, setOption, questions } = useSummaryContext()

  const handleChangeTimeRange = nextDateRange => {
    setDateRange(nextDateRange)
  }

  const filterComponent = (
    <YearSemesterSelector
      value={dateRange ?? { start: new Date(), end: new Date() }}
      onChange={handleChangeTimeRange}
      option={option}
      setOption={setOption}
    />
  )

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={filterComponent} />
      {questions.map(q => (
        <Sort
          key={q.id}
          field={q.id}
          label={getLanguageValue(q.data.label, i18n.language)}
          width={styles.resultCell.minWidth}
        />
      ))}
      <Sort field="feedbackCount" label={t('courseSummary:feedbackCount')} width={styles.countCell.width} />
      <Sort field="feedbackPercentage" label={t('courseSummary:feedbackPercentage')} width={styles.percentCell.width} />
      <Sort
        field="feedbackResponsePercentage"
        label={t('courseSummary:feedbackResponsePercentage')}
        width={styles.percentCell.width}
      />
    </Box>
  )
}

export default SorterRow
