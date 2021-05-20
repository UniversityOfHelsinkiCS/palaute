import React from 'react'

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  makeStyles,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

const useStyles = makeStyles({
  select: {
    textAlign: 'left',
  },
})

const options = [...Array(5)].map((v, i) => {
  const value = (new Date().getFullYear() - i).toString()

  return {
    value,
    label: value,
  }
})

const Filters = ({ year, onYearChange, className }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const labelId = 'courseSummaryYear'
  const label = t('courseSummary:yearLabel')

  const value = year ? year.toString() : null

  const handleChange = (event) => {
    onYearChange(parseInt(event.target.value, 10))
  }

  return (
    <div className={className}>
      <FormControl variant="outlined" fullWidth>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          onChange={handleChange}
          value={value}
          label={label}
          className={classes.select}
        >
          {options.map(({ value, label }) => (
            <MenuItem value={value} key={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export default Filters
