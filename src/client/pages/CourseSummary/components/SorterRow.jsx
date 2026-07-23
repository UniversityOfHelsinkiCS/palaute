import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { YearSemesterPeriodSelector } from '../../../components/common/YearSemesterPeriodSelector'
import { getLanguageValue } from '../../../util/languageUtils'
import { useSummaryContext } from '../context'
import RowHeader from './RowHeader'
import Sort from './Sort'

const styles = {
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: '1rem',
    rowGap: '0.5rem',
  },
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

export const SorterRow = ({ filterComponent, additionalFilters, questions: questionsProp, hideColumns = false }) => {
  const { t, i18n } = useTranslation()
  const { questions: contextQuestions } = useSummaryContext()
  const questions = questionsProp ?? contextQuestions

  return (
    <>
      {(filterComponent || additionalFilters) && (
        <Box sx={styles.filterContainer}>
          {additionalFilters}
          {filterComponent}
        </Box>
      )}
      {!hideColumns && (
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: '0.2rem' }}>
          <RowHeader />
          {questions.map(q => (
            <Sort
              key={q.id}
              field={String(q.id)}
              label={getLanguageValue(q.data.label, i18n.language)}
              width={styles.resultCell.minWidth}
            />
          ))}
          <Sort field="feedbackCount" label={t('courseSummary:feedbackCount')} width={styles.countCell.width} />
          <Sort
            field="feedbackPercentage"
            label={t('courseSummary:feedbackPercentage')}
            width={styles.percentCell.width}
          />
          <Sort
            field="feedbackResponsePercentage"
            label={t('courseSummary:feedbackResponsePercentage')}
            width={styles.percentCell.width}
          />
          <Sort field="feedbackCountCensored" label={t('courseSummary:censoredCount')} width={styles.countCell.width} />
        </Box>
      )}
    </>
  )
}

const SorterRowWithFilters = ({ allTime = false, filterComponents, hideColumns = false }) => {
  const { dateRange, setDateRange, option, setOption } = useSummaryContext()

  const handleChangeTimeRange = nextDateRange => {
    setDateRange(nextDateRange)
  }

  const filterComponent = (
    <YearSemesterPeriodSelector
      value={dateRange ?? { start: new Date(), end: new Date() }}
      onChange={handleChangeTimeRange}
      option={option}
      setOption={setOption}
      allowAll={allTime}
    />
  )

  return <SorterRow filterComponent={filterComponent} additionalFilters={filterComponents} hideColumns={hideColumns} />
}

export default SorterRowWithFilters
