import { Box, IconButton, makeStyles, Typography } from '@material-ui/core'
import { ChevronLeft, ChevronRight } from '@material-ui/icons'
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
 * 	value: number,
 * 	onChange: (year: number) => (),
 * 	minYear?: number,
 * }} params
 * @returns
 */
export const SemesterStepper = ({ value, onChange, minYear = 2020 }) => {
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
  const canDecrease = value > minYear

  return (
    <Box className={classes.stepper}>
      <Typography color="textSecondary" className={classes.stepperValue}>
        Lukuvuosi
      </Typography>
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
