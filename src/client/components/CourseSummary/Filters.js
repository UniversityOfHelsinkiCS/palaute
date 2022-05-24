import React from 'react'

import {
  TextField,
  InputAdornment,
  Box,
  FormControlLabel,
  Switch,
  makeStyles,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { useTranslation } from 'react-i18next'
import { YearSemesterSelector } from './YearSemesterSelector'

const useStyles = makeStyles({
  container: {
    textAlign: 'left',
  },
})

const Filters = ({
  keyword,
  onKeywordChange,
  includeOpenUniCourseUnits,
  onIncludeOpenUniCourseUnitsChange,
  dateRange,
  onDateRangeChange,
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
