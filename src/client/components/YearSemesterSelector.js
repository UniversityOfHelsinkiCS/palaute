import React, { useState } from 'react'
import * as _ from 'lodash'
import {
  Box,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'
import { useTranslation } from 'react-i18next'

const useYearSemesters = (currentStart) => {
  const now = new Date()
  const year = Math.min(
    currentStart.getFullYear(),
    now.getFullYear() - (now.getMonth() < 9 ? 1 : 0),
  )

  let semesters = _.range(2021, now.getFullYear() + 1)
    .flatMap((year) => [
      {
        start: new Date(`${year}-01-01`),
        end: new Date(`${year}-09-01`),
      },
      {
        start: new Date(`${year}-09-01`),
        end: new Date(`${year + 1}-01-01`),
      },
    ])
    .map((s, i) => ({ ...s, spring: i % 2 === 0 }))

  semesters = now.getMonth() < 9 ? semesters.slice(0, -1) : semesters

  return {
    year,
    semesters,
    currentSemester: semesters.find((s) => s.start >= currentStart),
  }
}

const useStyles = makeStyles({
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '70px',
    marginLeft: '0.9rem',
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '4px',
    paddingRight: '4px',
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
})

const YearStepper = ({ value, onChange }) => {
  const classes = useStyles()

  const handleIncrease = () => {
    onChange(value + 1)
  }

  const handleDecrease = () => {
    onChange(value - 1)
  }

  const now = new Date()
  const currentYear = now.getFullYear() + (now.getMonth() >= 9 ? 1 : 0)

  const displayValue = `${value} – ${value + 1}`

  const canIncrease = value + 1 < currentYear
  const canDecrease = value > 2020

  return (
    <Box className={classes.stepperContainer}>
      <IconButton onClick={handleDecrease} disabled={!canDecrease}>
        <ChevronLeft />
      </IconButton>
      <Typography className={classes.stepperValue}>{displayValue}</Typography>
      <IconButton onClick={handleIncrease} disabled={!canIncrease}>
        <ChevronRight />
      </IconButton>
    </Box>
  )
}

const SemesterSelector = ({ value, onChange, semesters }) => {
  const { t } = useTranslation()

  const classes = useStyles()

  return (
    <Box className={classes.selectorContainer}>
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
export const YearSemesterSelector = ({ value, onChange }) => {
  const classes = useStyles()

  const { t } = useTranslation()

  const [option, setOption] = useState('year')
  const { year, semesters, currentSemester } = useYearSemesters(value.start)

  const handleYearChange = (year) => {
    onChange({
      start: new Date(`${year}-09-01`),
      end: new Date(`${year + 1}-09-01`),
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
    <Box className={classes.stepper}>
      <Select value={option} onChange={handleOptionChange}>
        <MenuItem value="year">{t('courseSummary:year')}</MenuItem>
        <MenuItem value="semester">{t('courseSummary:semester')}</MenuItem>
      </Select>
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
    </Box>
  )
}
