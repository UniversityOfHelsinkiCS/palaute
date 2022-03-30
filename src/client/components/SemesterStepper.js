import { Box, IconButton, makeStyles, Typography } from '@material-ui/core'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'
import { addYears, subYears } from 'date-fns'
import React from 'react'

const useStyles = makeStyles({
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '1px',
    marginLeft: '0.78rem', // trust me I used a ruler
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
  stepperValue: {
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
})

/**
 *
 * @param {{
 * 	value: Date,
 * 	onChange: (newValue: Date) => (),
 * 	maxValue?: Date,
 * 	minValue?: Date,
 * }} params
 * @returns
 */
export const SemesterStepper = ({
  value,
  onChange,
  maxValue = new Date(),
  minValue = new Date('2020-9-1'),
}) => {
  const classes = useStyles()

  const handleIncrease = () => {
    onChange(addYears(value, 1))
  }

  const handleDecrease = () => {
    onChange(subYears(value, 1))
  }

  const year = value.getFullYear()
  const displayValue = `${year} – ${year + 1}`

  const canIncrease = year + 1 < maxValue.getFullYear()
  const canDecrease = year > minValue.getFullYear()

  return (
    <Box className={classes.stepper}>
      <Typography color="textSecondary">Lukuvuosi</Typography>
      <Box className={classes.stepperContainer}>
        <IconButton onClick={handleDecrease} disabled={!canDecrease}>
          <ChevronLeft />
        </IconButton>
        <Typography className={classes.stepperValue}>{displayValue}</Typography>
        <IconButton onClick={handleIncrease} disabled={!canIncrease}>
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  )
}
