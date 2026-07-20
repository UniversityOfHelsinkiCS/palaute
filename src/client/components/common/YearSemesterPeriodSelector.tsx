import React, { useState, useEffect } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Period } from '../../../common/studyPeriods'
import { usePeriods } from '../../util/periodUtils'
import { STUDY_YEAR_START_MONTH } from '../../util/common'
import { getYearDisplayName, useAcademicYears } from '../../util/yearUtils'
import { useSemesters } from '../../util/semesterUtils'
import { focusIndicatorStyle } from '../../util/accessibility'

type DateRange = {
  start: Date
  end: Date
}

type Season = 'spring' | 'fall' | 'both'

type Semester = DateRange & {
  season: Season
}

const styles = {
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px 8px',
    minHeight: '70px',
  },
  selectorContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}

type FilterSelectorProps<T> = {
  selectorTarget: string
  value: T
  onChange: (option: T) => void
  options: T[]
  getDisplayName: (option: T) => string
}

// The options are full Date-range/Semester/Period objects, but MUI's Select/MenuItem `value` has
// to be a string. `getDisplayName` is already required to produce a name unique per option (it's
// also used as the React `key` below), so it doubles as that string identity.
const FilterSelector = <T,>({ selectorTarget, value, onChange, options, getDisplayName }: FilterSelectorProps<T>) => {
  const { t } = useTranslation()

  return (
    <FormControl sx={styles.selectorContainer} size="small">
      <InputLabel id={`${selectorTarget}-selector-label`}>{t(`courseSummary:${selectorTarget}`)}</InputLabel>
      <Select
        id={`${selectorTarget}-selector`}
        labelId={`${selectorTarget}-selector-label`}
        label={t(`courseSummary:${selectorTarget}`)}
        value={getDisplayName(value)}
        onChange={event => {
          const selected = options.find(option => getDisplayName(option) === event.target.value)
          if (selected) onChange(selected)
        }}
      >
        {options.map(option => {
          const displayName = getDisplayName(option)

          return (
            <MenuItem
              data-cy={`${selectorTarget}-selector-item-${displayName}`}
              value={displayName}
              key={displayName}
              onClick={() => {
                if (option === value) {
                  onChange(option)
                }
              }}
            >
              {displayName}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

type YearSelectorProps = {
  value: DateRange | 'all'
  onChange: (range: DateRange | 'all') => void
  years: DateRange[]
  allowAll?: boolean
}

export const YearSelector = ({ value, onChange, years, allowAll = false }: YearSelectorProps) => {
  const { t } = useTranslation()

  const options: (DateRange | 'all')[] = allowAll ? ['all', ...years] : years

  const getDisplayName = (option: DateRange | 'all') => {
    if (option === 'all') return t('courseSummary:all')

    return getYearDisplayName(option)
  }

  return (
    <FilterSelector
      selectorTarget="year"
      value={value}
      onChange={onChange}
      options={options}
      getDisplayName={getDisplayName}
    />
  )
}

const SemesterSelector = ({
  value,
  onChange,
  semesters,
}: {
  value: Semester
  onChange: (semester: Semester) => void
  semesters: Semester[]
}) => {
  const { t } = useTranslation()

  const getSemesterDisplayName = (semester: Semester) => {
    if (semester.season === 'both') return t('courseSummary:notSelected')

    const displayName = `${semester.start.getFullYear()} ${
      semester.season === 'spring' ? t('courseSummary:spring') : t('courseSummary:fall')
    }`

    return displayName
  }

  return (
    <FilterSelector
      selectorTarget="semester"
      value={value}
      onChange={onChange}
      options={semesters}
      getDisplayName={getSemesterDisplayName}
    />
  )
}

const PeriodSelector = ({
  value,
  onChange,
  periods,
}: {
  value: Period
  onChange: (period: Period) => void
  periods: Period[]
}) => {
  const { t } = useTranslation()

  const getPeriodDisplayName = (period: Period) => {
    if (period.name === 'not selected') return t('courseSummary:notSelected')

    const displayName = `${period.start.getFullYear()} ${
      period.name === 'Summer' ? t('courseSummary:summer') : `${t('courseSummary:period')} ${period.name}`
    }`

    return displayName
  }

  return (
    <FilterSelector
      selectorTarget="period"
      value={value}
      onChange={onChange}
      options={periods}
      getDisplayName={getPeriodDisplayName}
    />
  )
}

type YearSemesterPeriodSelectorProps = {
  value?: DateRange
  onChange: (range: DateRange) => void
  option: string
  setOption: (option: string) => void
  allowAll?: boolean
  futureYears?: number
}

export const YearSemesterPeriodSelector = ({
  value,
  onChange,
  option,
  setOption,
  allowAll,
  futureYears = 0,
}: YearSemesterPeriodSelectorProps) => {
  const { t } = useTranslation()

  const [semesterReset, setSemesterReset] = useState(true)
  const [periodReset, setPeriodReset] = useState(true)

  const { academicYears, selectedYear } = useAcademicYears(value?.start ?? new Date(), futureYears)
  const { semesters, selectedSemester } = useSemesters(value?.start ?? new Date(), semesterReset)
  const { periods, selectedPeriod } = usePeriods(value?.start ?? new Date(), periodReset, semesterReset)

  const handleOptionChange = (event: React.MouseEvent<HTMLElement>) => {
    // This group isn't `exclusive`, so MUI's own (event, value) callback value would be an array;
    // we read the clicked button's native `value` attribute directly instead, as the original did.
    const newOption = event.currentTarget.getAttribute('value')
    if (newOption) setOption(newOption)
  }

  const handleYearChange = ({ start, end }: DateRange) => {
    setPeriodReset(true)
    setSemesterReset(true)
    onChange({ start, end })
  }

  const handleSemesterChange = ({ start, end }: DateRange) => {
    setPeriodReset(true)

    if (start.getMonth() === STUDY_YEAR_START_MONTH - 1 && end.getMonth() === STUDY_YEAR_START_MONTH - 2) {
      setSemesterReset(true)
    } else {
      setSemesterReset(false)
    }

    onChange({ start, end })
  }

  const handlePeriodChange = ({ start, end }: DateRange) => {
    const fourMonthsFromStart = new Date(start)
    fourMonthsFromStart.setMonth(fourMonthsFromStart.getMonth() + 4)

    if (end > fourMonthsFromStart) {
      setPeriodReset(true)
    } else {
      setPeriodReset(false)
    }

    onChange({ start, end })
  }

  useEffect(() => {
    if (!allowAll) {
      setOption('filter')
      handleYearChange(selectedYear)
    }
  }, [allowAll])

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={event => event.stopPropagation()}>
      <Box sx={styles.filters}>
        {allowAll && (
          <ToggleButtonGroup
            id="all-filter-selector"
            value={option}
            onChange={handleOptionChange}
            sx={{ color: 'primary', ml: 0.5 }}
          >
            <ToggleButton value="all" size="small" sx={focusIndicatorStyle()} disableRipple>
              {t('courseSummary:all')}
            </ToggleButton>
            <ToggleButton value="filter" size="small" sx={focusIndicatorStyle()} disableRipple>
              {t('courseSummary:filter')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
        {option !== 'all' && (
          <Box sx={styles.filters}>
            <YearSelector value={selectedYear} onChange={handleYearChange} years={academicYears} />
            <SemesterSelector value={selectedSemester} onChange={handleSemesterChange} semesters={semesters} />
            <PeriodSelector value={selectedPeriod} onChange={handlePeriodChange} periods={periods} />
          </Box>
        )}
      </Box>
    </div>
  )
}
