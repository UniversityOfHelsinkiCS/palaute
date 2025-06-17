import React from 'react'
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
import { getStudyYearRange, useYearSemesters } from '../../util/yearSemesterUtils'
import { usePeriods } from '../../util/periodUtils'
import { STUDY_YEAR_START_MONTH } from '../../util/common'

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
    paddingLeft: '1.5rem',
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

const SemesterSelector = ({ value, onChange, semesters, labelledBy, sx = styles.selectorContainer }) => {
  const { t } = useTranslation()

  return (
    <FormControl sx={sx} size="small">
      {!labelledBy && <InputLabel id="semester-selector-label">{t('courseSummary:semester')}</InputLabel>}
      <Select
        id="semester-selector"
        labelId={!labelledBy ? 'semester-selector-label' : undefined}
        label={!labelledBy ? t('courseSummary:semester') : undefined}
        aria-labelledby={labelledBy ?? undefined}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {semesters.map(s => {
          const semesterName = `${s.start.getFullYear()} ${
            s.spring ? t('courseSummary:spring') : t('courseSummary:fall')
          }`

          return (
            <MenuItem data-cy={`semester-selector-item-${semesterName}`} value={s} key={s.start}>
              {semesterName}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

// Can be refactored with the previous component after this works
const PeriodSelector = ({ value, onChange, periods, labelledBy, sx = styles.selectorContainer }) => {
  const { t } = useTranslation()

  return (
    <FormControl sx={sx} size="small">
      {!labelledBy && <InputLabel id="period-selector-label">{t('courseSummary:period')}</InputLabel>}
      <Select
        id="period-selector"
        labelId={!labelledBy ? 'period-selector-label' : undefined}
        label={!labelledBy ? t('courseSummary:period') : undefined}
        aria-labelledby={labelledBy ?? undefined}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {periods.map(p => {
          const periodName = `${p.start.getFullYear()} ${
            p.name === 'Summer' ? t('courseSummary:summer') : `${t('courseSummary:period')} ${p.name}`
          }`

          return (
            <MenuItem data-cy={`period-selector-item-${periodName}`} value={p} key={p.start}>
              {periodName}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
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
  const { t } = useTranslation()
  const { year, semesters, currentSemester } = useYearSemesters(value?.start ?? new Date(), futureYears)
  const { periods, selectedPeriod } = usePeriods(value?.start ?? new Date())

  const handleYearChange = year => {
    const range = getStudyYearRange(new Date(`${year + 1}-01-01`))
    onChange(range)
  }

  const handleSemesterChange = ({ start, end }) => {
    onChange({ start, end })
  }

  const handlePeriodChange = ({ start, end }) => {
    onChange({ start, end })
  }

  const handleOptionChange = event => {
    if (event.target.value === 'year') {
      handleYearChange(year)
    } else if (event.target.value === 'semester') {
      handleSemesterChange(currentSemester)
    } else {
      handlePeriodChange(selectedPeriod)
    }
    setOption(event.target.value)
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={event => event.stopPropagation()}>
      <Box sx={styles.stepper}>
        <ToggleButtonGroup id="year-semester-selector" value={option} onChange={handleOptionChange} color="primary">
          {allowAll && (
            <ToggleButton value="all" size="small">
              {t('courseSummary:all')}
            </ToggleButton>
          )}
          <ToggleButton value="year" size="small">
            {t('courseSummary:year')}
          </ToggleButton>
          <ToggleButton value="semester" size="small">
            {t('courseSummary:semester')}
          </ToggleButton>
          <ToggleButton value="period" size="small">
            {t('courseSummary:period')}
          </ToggleButton>
        </ToggleButtonGroup>
        {option !== 'all' && (
          <Box>
            {option === 'year' && (
              <AcademicYearSelector value={year} onChange={handleYearChange} labelledBy="year-semester-selector" />
            )}
            {option === 'semester' && (
              <SemesterSelector
                value={currentSemester}
                onChange={handleSemesterChange}
                semesters={semesters}
                labelledBy="year-semester-selector"
              />
            )}
            {option === 'period' && (
              <PeriodSelector
                value={selectedPeriod}
                onChange={handlePeriodChange}
                periods={periods}
                labelledBy="year-semester-selector"
              />
            )}
          </Box>
        )}
      </Box>
    </div>
  )
}
