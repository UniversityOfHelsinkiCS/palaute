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
