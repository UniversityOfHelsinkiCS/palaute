import React, { useState } from 'react'
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { usePeriods } from '../../util/periodUtils'
import { STUDY_YEAR_START_MONTH } from '../../util/common'
import { getYearDisplayName, useAcademicYears } from '../../util/yearUtils'
import { useSemesters } from '../../util/semesterUtils'

const styles = {
  stepper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    minHeight: '70px',
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '4px',
    paddingRight: '4px',
    marginBottom: '4px',
  },
  selectorContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  stepperValue: {
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  button: {
    color: theme => theme.palette.info.main,
    '&:hover': {
      background: theme => theme.palette.action.hover,
      color: theme => theme.palette.text.primary,
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    marginX: '0.4rem',
  },
  disabledButton: {
    opacity: '0.0',
    zIndex: -10,
  },
}

export const AcademicYearSelector = ({ value, onChange, labelledBy }) => {
  const NOW = new Date()
  const MIN_YEAR = 2020
  const CURRENT_YEAR = NOW.getFullYear() + (NOW.getMonth() + 1 >= STUDY_YEAR_START_MONTH ? 1 : 0)

  const displayValue = `${value} – ${value + 1}`

  const canIncrease = value + 1 < CURRENT_YEAR
  const canDecrease = value > MIN_YEAR

  const handleIncrease = (increment = 1) => {
    if (value + increment <= CURRENT_YEAR) {
      onChange(value + increment)
    }
    if (value + increment >= CURRENT_YEAR) {
      onChange(CURRENT_YEAR - 1)
    }
  }

  const handleDecrease = (decrement = 1) => {
    if (value - decrement >= MIN_YEAR) {
      onChange(value - decrement)
    }
  }

  const handleSetMaxValue = () => {
    onChange(CURRENT_YEAR - 1)
  }

  const handleSetMinValue = () => {
    onChange(MIN_YEAR)
  }

  // Handle keyboard events per the following document: https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
  const handleKeyPress = event => {
    let flag = false

    switch (event.code) {
      case 'ArrowDown':
        handleDecrease()
        flag = true
        break

      case 'ArrowUp':
        handleIncrease()
        flag = true
        break

      case 'Home':
        handleSetMinValue()
        flag = true
        break

      case 'End':
        handleSetMaxValue()
        flag = true
        break

      default:
        break
    }

    if (flag) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <Box
      id="academic-year-selector"
      tabIndex={0}
      sx={styles.stepperContainer}
      role="spinbutton"
      aria-labelledby={labelledBy ?? undefined}
      aria-valuenow={value}
      aria-valuemin={MIN_YEAR}
      aria-valuemax={CURRENT_YEAR - 1}
      aria-valuetext={displayValue}
      onKeyDown={handleKeyPress}
    >
      <IconButton
        tabIndex={-1}
        onClick={() => handleDecrease()}
        disabled={!canDecrease}
        sx={[!canDecrease ? styles.disabledButton : {}, styles.button]}
        size="small"
        disableTouchRipple
      >
        <ChevronLeft />
      </IconButton>
      <Typography component="span" sx={styles.stepperValue}>
        {displayValue}
      </Typography>
      <IconButton
        tabIndex={-1}
        onClick={() => handleIncrease()}
        disabled={!canIncrease}
        sx={[!canIncrease ? styles.disabledButton : {}, styles.button]}
        size="small"
        disableTouchRipple
      >
        <ChevronRight />
      </IconButton>
    </Box>
  )
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
      <Box sx={styles.stepper}>
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
          <Box sx={styles.stepper}>
            <YearSelector value={selectedYear} onChange={handleYearChange} years={academicYears} />
            <SemesterSelector value={selectedSemester} onChange={handleSemesterChange} semesters={semesters} />
            <PeriodSelector value={selectedPeriod} onChange={handlePeriodChange} periods={periods} />
          </Box>
        )}
      </Box>
    </div>
  )
}
