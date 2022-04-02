import React from 'react'

import {
  TextField,
  InputAdornment,
  Box,
  FormControlLabel,
  Switch,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  makeStyles,
} from '@material-ui/core'

import SearchIcon from '@material-ui/icons/Search'
import SortIcon from '@material-ui/icons/Sort'

import { useTranslation } from 'react-i18next'

import { ORDER_BY_OPTIONS } from './utils'
import { YearSemesterSelector } from '../YearSemesterSelector'

const useStyles = makeStyles({
  container: {
    textAlign: 'left',
  },
})

const OrderSelect = ({ orderBy, onOrderByChange }) => {
  const { t } = useTranslation()

  const label = t('courseSummary:orderByLabel')

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={orderBy}
        onChange={(event) => onOrderByChange(event.target.value)}
        label={label}
        startAdornment={
          <InputAdornment position="start">
            <SortIcon />
          </InputAdornment>
        }
      >
        {ORDER_BY_OPTIONS.map(({ value, label }) => (
          <MenuItem value={value} key={value}>
            {t(label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const Filters = ({
  keyword,
  onKeywordChange,
  includeOpenUniCourseUnits,
  onIncludeOpenUniCourseUnitsChange,
  dateRange,
  onDateRangeChange,
  orderBy,
  onOrderByChange,
}) => {
  const { t } = useTranslation()
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <Box mb={3}>
        <YearSemesterSelector value={dateRange} onChange={onDateRangeChange} />
      </Box>
      <Box mb={2}>
        <TextField
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          variant="outlined"
          placeholder={t('courseSummary:searchPlaceholder')}
          label={t('courseSummary:searchLabel')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>
      <Box mb={2}>
        <OrderSelect orderBy={orderBy} onOrderByChange={onOrderByChange} />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={includeOpenUniCourseUnits}
            onChange={(event) => {
              onIncludeOpenUniCourseUnitsChange(event.target.checked)
            }}
            color="primary"
          />
        }
        label={t('courseSummary:includeOpenUniCourses')}
      />
    </div>
  )
}

export default Filters
