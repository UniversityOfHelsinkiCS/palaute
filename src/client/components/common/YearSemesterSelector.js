import React from 'react'
import * as _ from 'lodash'
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { startOfStudyYear } from '../../util/startOfStudyYear'

// Year starting month
const MONTH = 8

const useYearSemesters = (currentStart) => {
  const now = new Date()
  const year = Math.min(
    currentStart.getFullYear(),
    startOfStudyYear(now).getFullYear(),
  )

  let semesters = _.range(2021, now.getFullYear() + 1)
    .flatMap((year) => [
      {
        start: new Date(`${year}-01-01`),
        end: new Date(`${year}-0${MONTH}-01`),
      },
      {
        start: new Date(`${year}-0${MONTH}-01`),
        end: new Date(`${year + 1}-01-01`),
      },
    ])
    .map((s, i) => ({ ...s, spring: i % 2 === 0 }))
    .reverse()
  semesters = now.getMonth() + 1 < MONTH ? semesters.slice(1) : semesters

  const currentSemester =
    semesters.find((s) => s.start <= currentStart) ||
    semesters.find((s) => s.start <= now)

  return {
    year,
    semesters,
    currentSemester,
  }
}

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
    '&:hover': {
      background: 0,
      color: (theme) => theme.palette.info.light,
      boxShadow: 'rgba(99, 99, 255, 0.2) 0px 2px 7px 0px',
    },
    marginX: '0.4rem',
  },
  disabledButton: {
    opacity: '0.0',
    zIndex: -10,
  },
}

const YearStepper = ({ value, onChange }) => {
  const handleIncrease = () => {
    onChange(value + 1)
  }

  const handleDecrease = () => {
    onChange(value - 1)
  }

  const now = new Date()
  const currentYear = now.getFullYear() + (now.getMonth() + 1 >= MONTH ? 1 : 0)

  const displayValue = `${value} – ${value + 1}`

  const canIncrease = value + 1 < currentYear
  const canDecrease = value > 2020

  return (
    <Box sx={styles.stepperContainer}>
      <IconButton
        onClick={handleDecrease}
        disabled={!canDecrease}
        sx={[!canDecrease ? styles.disabledButton : {}, styles.button]}
        size="small"
      >
        <ChevronLeft fontSize="large" />
      </IconButton>
      <Typography sx={styles.stepperValue}>{displayValue}</Typography>
      <IconButton
        onClick={handleIncrease}
        sx={[!canIncrease ? styles.disabledButton : {}, styles.button]}
        size="small"
      >
        <ChevronRight fontSize="large" />
      </IconButton>
    </Box>
  )
}

const SemesterSelector = ({ value, onChange, semesters }) => {
  const { t } = useTranslation()

  return (
    <Box sx={styles.selectorContainer}>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {semesters.map((s) => (
          <MenuItem value={s} key={s.start}>
            {`${s.start.getFullYear()} ${
              s.spring ? t('courseSummary:spring') : t('courseSummary:fall')
            }`}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}

/**
 *
 * @param {{
 * 	value: { start: Date, end: Date },
 * 	onChange: ({ start: Date, end: Date }) => (),
 * }} params
 * @returns
 */
export const YearSemesterSelector = ({
  value,
  onChange,
  option,
  setOption,
  allowAll,
}) => {
  const { t } = useTranslation()
  const { year, semesters, currentSemester } = useYearSemesters(
    value?.start ?? new Date(),
  )

  const handleYearChange = (year) => {
    onChange({
      start: new Date(`${year}-0${MONTH}-01`),
      end: new Date(`${year + 1}-0${MONTH}-01`),
    })
  }

  const handleSemesterChange = ({ start, end }) => {
    onChange({ start, end })
  }

  const handleOptionChange = (event) => {
    if (event.target.value === 'year') {
      handleYearChange(year)
    } else {
      handleSemesterChange(currentSemester)
    }
    setOption(event.target.value)
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={(event) => event.stopPropagation()}>
      <Box sx={styles.stepper}>
        <ToggleButtonGroup
          value={option}
          onChange={handleOptionChange}
          color="primary"
        >
          {allowAll && (
            <ToggleButton value="all">{t('courseSummary:all')}</ToggleButton>
          )}
          <ToggleButton value="year">{t('courseSummary:year')}</ToggleButton>
          <ToggleButton value="semester">
            {t('courseSummary:semester')}
          </ToggleButton>
        </ToggleButtonGroup>
        {option !== 'all' && (
          <Box>
            {option === 'year' ? (
              <YearStepper value={year} onChange={handleYearChange} />
            ) : (
              <SemesterSelector
                value={currentSemester}
                onChange={handleSemesterChange}
                semesters={semesters}
              />
            )}
          </Box>
        )}
      </Box>
    </div>
  )
}
