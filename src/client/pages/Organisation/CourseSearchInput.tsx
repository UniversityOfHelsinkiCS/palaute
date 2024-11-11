import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Autocomplete, TextField, Grid, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOrganisationCourseSearch } from './useOrganisationCourseSearch'
import { useDebounce } from './useDebounce'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import { getSemesterRange } from '../../util/yearSemesterUtils'

type DateRange = { start: Date; end: Date }

const CourseSearchInput = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const { code } = useParams<{ code: string }>()
  const [courseSearch, setCourseSearch] = useState('')
  const debounceSearch = useDebounce(courseSearch, 700)
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getSemesterRange(new Date())
  )
  const [option, setOption] = React.useState<string>('semester')

  const { data: courses } = useOrganisationCourseSearch({
    organisationCode: code,
    search: debounceSearch,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])

  const getOptionLabel = (course: any) => {
    const courseRealisation = course.feedbackTargets[0]?.courseRealisation
    const startDate = new Date(courseRealisation.startDate).toLocaleDateString()
    const endDate = new Date(courseRealisation.endDate).toLocaleDateString()
    return `${course?.name[lang] || ''} (${startDate} - ${endDate})`
  }

  const handleDateRangeChange = (nextDateRange: DateRange) => {
    setDateRange(nextDateRange)
  }

  return (
    <>
      <Grid xs={12} item>
        <Autocomplete
          disableCloseOnSelect
          multiple
          value={selectedCourses}
          onChange={(_, value) => {
            setSelectedCourses(value)
          }}
          inputValue={courseSearch}
          onInputChange={(_, value) => {
            setCourseSearch(value)
          }}
          options={courses ?? []}
          getOptionLabel={getOptionLabel}
          renderInput={(params: any) => (
            <TextField
              {...params}
              label={t('organisationSurveys:AddCourses')}
              variant="outlined"
            />
          )}
        />
      </Grid>
      <Grid xs={4} item>
        <YearSemesterSelector
          value={dateRange ?? { start: new Date(), end: new Date() }}
          onChange={handleDateRangeChange}
          option={option}
          futureYears={0}
          setOption={setOption}
          allowAll={false}
        />
      </Grid>
      <Grid xs={4} item>
        <Button sx={{ padding: '1.5rem' }} onClick={() => null}>
          {t('organisationSurveys:AddStudents')}
        </Button>
      </Grid>
    </>
  )
}

export default CourseSearchInput
