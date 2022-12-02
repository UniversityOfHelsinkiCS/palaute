import React from 'react'
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
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'

import { YearSemesterSelector } from '../common/YearSemesterSelector'
import useOrganisationTags from '../../hooks/useOrganisationTags'
import useHistoryState from '../../hooks/useHistoryState'
import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  container: {
    minWidth: (theme) => ({
      [theme.breakpoints.up('md')]: 500,
    }),
    textAlign: 'left',
    marginBottom: '0rem',
    padding: '1rem',
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
  const { code } = useParams()

  const [option, setOption] = useHistoryState('timeperiodOption', 'year')

  const { tags, isLoading: tagsLoading } = useOrganisationTags(code)
  const sortedTags = _.sortBy(tags, (tag) =>
    getLanguageValue(tag.name, i18n.language),
  )

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
    <Box sx={styles.container}>
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
      {tagId && !tagsLoading && (
        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>{t('courseSummary:tagLabel')}</InputLabel>
            <Select
              value={tagId}
              onChange={(event) => onTagChange(event.target.value)}
              label="Opintosuunta"
            >
              <MenuItem value="All">{t('courseSummary:allTags')}</MenuItem>
              {sortedTags.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  {name[i18n.language]}
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
    </Box>
  )
}

export default Filters
