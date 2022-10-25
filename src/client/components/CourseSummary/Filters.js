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
import _ from 'lodash'

import { YearSemesterSelector } from './YearSemesterSelector'
import { data, tags } from '../../../config/data' // TODO get tags from db
import useHistoryState from '../../hooks/useHistoryState'
import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  container: {
    minWidth: 500,
    // minHeight: 300,
    textAlign: 'left',
    marginBottom: '1rem',
  },
}

const Filters = ({
  facultyCode,
  keyword,
  facultyAccess,
  onFacultyChange,
  tagId,
  onTagChange,
  onKeywordChange,
  includeOpenUniCourseUnits,
  onIncludeOpenUniCourseUnitsChange,
  dateRange,
  onDateRangeChange,
}) => {
  const { t, i18n } = useTranslation()
  const [option, setOption] = useHistoryState('timeperiodOption', 'year')

  const faculties = React.useMemo(
    () =>
      facultyAccess
        ? _.sortBy(
            facultyAccess.map((faculty) => ({
              code: faculty.code,
              name: faculty.name,
            })),
            (faculty) => getLanguageValue(faculty.name, i18n.language),
          )
        : [],
    [facultyAccess, i18n.language],
  )

  return (
    <div css={styles.container}>
      <Box mb={3}>
        <YearSemesterSelector
          value={dateRange ?? { start: new Date(), end: new Date() }}
          onChange={onDateRangeChange}
          option={option}
          setOption={setOption}
        />
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
              {faculties.map((faculty) => (
                <MenuItem key={faculty.code} value={faculty.code}>
                  {faculty.name[i18n.language] || faculty.name.se}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      {tagId && (
        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>{t('courseSummary:tagLabel')}</InputLabel>
            <Select
              value={tagId}
              onChange={(event) => onTagChange(event.target.value)}
              label="Opintosuunta"
            >
              <MenuItem value="All">{t('courseSummary:allTags')}</MenuItem>
              {tags.map((tag, index) => (
                <MenuItem key={index} value={index + 1}>
                  {tag[i18n.language]}
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
