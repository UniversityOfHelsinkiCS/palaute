import React, { useState } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { usePeriods } from '../../util/periodUtils'
import { STUDY_YEAR_START_MONTH } from '../../util/common'
import { getYearDisplayName, useAcademicYears } from '../../util/yearUtils'
import { useSemesters } from '../../util/semesterUtils'

const styles = {
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    minHeight: '70px',
  },
  selectorContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}

const FilterSelector = ({ selectorTarget, value, onChange, options, getDisplayName }) => {
  const { t } = useTranslation()

  return (
    <FormControl sx={styles.selectorContainer} size="small">
      <InputLabel id={`${selectorTarget}-selector-label`}>{t(`courseSummary:${selectorTarget}`)}</InputLabel>
      <Select
        id={`${selectorTarget}-selector`}
        labelId={`${selectorTarget}-selector-label`}
        label={t(`courseSummary:${selectorTarget}`)}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {options.map(option => {
          const displayName = getDisplayName(option)

          return (
            <MenuItem
              data-cy={`${selectorTarget}-selector-item-${displayName}`}
              value={option}
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

const YearSelector = ({ value, onChange, years }) => (
  <FilterSelector
    selectorTarget="year"
    value={value}
    onChange={onChange}
    options={years}
    getDisplayName={getYearDisplayName}
  />
)

const SemesterSelector = ({ value, onChange, semesters }) => {
  const { t } = useTranslation()

  const getSemesterDisplayName = semester => {
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

const PeriodSelector = ({ value, onChange, periods }) => {
  const { t } = useTranslation()

  const getPeriodDisplayName = period => {
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

/**
 *
 * @param {{
 * 	value: { start: Date, end: Date },
 * 	onChange: ({ start: Date, end: Date }) => void,
 *  option: string,
 *  setOption: (string) => void,
 *  allowAll: boolean
 *  futureYears: number
 * }} params§
 * @returns
 */
export const YearSemesterSelector = ({ value, onChange, option, setOption, allowAll, futureYears = 0 }) => {
  const [semesterReset, setSemesterReset] = useState(true)
  const [periodReset, setPeriodReset] = useState(true)
  const { t } = useTranslation()

  const { academicYears, selectedYear } = useAcademicYears(value?.start ?? new Date(), futureYears)
  const { semesters, selectedSemester } = useSemesters(value?.start ?? new Date(), semesterReset)
  const { periods, selectedPeriod } = usePeriods(value?.start ?? new Date(), periodReset, semesterReset)

  const handleOptionChange = event => {
    setOption(event.target.value)
  }

  const handleYearChange = ({ start, end }) => {
    setPeriodReset(true)
    setSemesterReset(true)
    onChange({ start, end })
  }

  const handleSemesterChange = ({ start, end }) => {
    setPeriodReset(true)

    if (start.getMonth() === STUDY_YEAR_START_MONTH - 1 && end.getMonth() === STUDY_YEAR_START_MONTH - 2) {
      setSemesterReset(true)
    } else {
      setSemesterReset(false)
    }

    onChange({ start, end })
  }

  const handlePeriodChange = ({ start, end }) => {
    const fourMonthsFromStart = new Date(start)
    fourMonthsFromStart.setMonth(fourMonthsFromStart.getMonth() + 4)

    if (end > fourMonthsFromStart) {
      setPeriodReset(true)
    } else {
      setPeriodReset(false)
    }

    onChange({ start, end })
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={event => event.stopPropagation()}>
      <Box sx={styles.filters}>
        {allowAll && (
          <ToggleButtonGroup id="all-filter-selector" value={option} onChange={handleOptionChange} color="primary">
            {allowAll && (
              <ToggleButton value="all" size="small">
                {t('courseSummary:all')}
              </ToggleButton>
            )}
            <ToggleButton value="filter" size="small">
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
