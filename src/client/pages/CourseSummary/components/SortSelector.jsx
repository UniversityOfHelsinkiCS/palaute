import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../../util/accessibility'
import { getShortLabelValue } from '../../../util/languageUtils'
import { useSummaryContext } from '../context'

/**
 * A "sort by" selector that offers every sortable column as one asc/desc pair of options.
 * Used instead of per-column sort buttons (see Sort.jsx) in table view.
 */
const SortSelector = ({ questions }) => {
  const { t, i18n } = useTranslation()
  const { sortBy, setSortBy } = useSummaryContext()

  const labelId = 'sort-selector-label'
  const selectId = 'sort-selector'

  const fields = [
    ...questions.map(q => ({
      field: String(q.id),
      label: getShortLabelValue(q.data.shortLabel, q.data.label, i18n.language),
    })),
    { field: 'feedbackCount', label: t('courseSummary:feedbackCount') },
    { field: 'feedbackPercentage', label: t('courseSummary:feedbackPercentage') },
    { field: 'feedbackResponsePercentage', label: t('courseSummary:feedbackResponsePercentage') },
    { field: 'feedbackCountCensored', label: t('courseSummary:censoredCount') },
  ]

  const defaultOption = { field: 'code', order: 'asc', label: t('courseSummary:summaryTarget') }

  const options = [
    defaultOption,
    ...fields.flatMap(({ field, label }) => [
      { field, order: 'asc', label },
      { field, order: 'desc', label },
    ]),
  ]

  const selectedIndex = options.findIndex(({ field, order }) => field === sortBy[0] && order === sortBy[1])
  const value = selectedIndex === -1 ? '0' : String(selectedIndex)

  const handleChange = event => {
    const { field, order } = options[Number(event.target.value)]

    setSortBy([field, order])
  }

  return (
    <FormControl size="small" sx={{ width: '18rem' }}>
      <InputLabel id={labelId}>{t('courseSummary:sortBy')}</InputLabel>
      <Select
        labelId={labelId}
        id={selectId}
        label={t('courseSummary:sortBy')}
        value={value}
        onChange={handleChange}
        sx={focusIndicatorStyle()}
      >
        {options.map(({ field, order, label }, index) =>
          index === 0 ? (
            <MenuItem key={`${field}-${order}`} value={String(index)}>
              {label}
            </MenuItem>
          ) : (
            <MenuItem key={`${field}-${order}`} value={String(index)}>
              {`${label}, ${order === 'desc' ? t('common:descending') : t('common:ascending')}`}
            </MenuItem>
          )
        )}
      </Select>
    </FormControl>
  )
}

export default SortSelector
