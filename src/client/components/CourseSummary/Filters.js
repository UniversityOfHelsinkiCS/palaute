import React from 'react'
/** @jsxImportSource @emotion/react */

import {
  TextField,
  InputAdornment,
  Box,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

import { YearSemesterSelector } from './YearSemesterSelector'
import { data } from '../../../config/data'

const styles = {
  container: {
    textAlign: 'left',
    marginBottom: '1rem',
  },
}

const Filters = ({
  facultyCode,
  keyword,
  onFacultyChange,
  onKeywordChange,
  includeOpenUniCourseUnits,
  onIncludeOpenUniCourseUnitsChange,
  dateRange,
  onDateRangeChange,
}) => {
  const { t, i18n } = useTranslation()

  return (
    <div css={styles.container}>
      <Box mb={3}>
        <YearSemesterSelector value={dateRange} onChange={onDateRangeChange} />
      </Box>
      {facultyCode && (
        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>{t('courseSummary:facultyLabel')}</InputLabel>
            <Select
              value={facultyCode}
              onChange={(event) => onFacultyChange(event.target.value)}
              label="Tiedekunta"
            >
              <MenuItem value="All">{t('courseSummary:allFaculties')}</MenuItem>
              {data.map((faculty) => (
                <MenuItem key={faculty.code} value={faculty.code}>
                  {faculty.name[i18n.language] || faculty.name.se}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
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
