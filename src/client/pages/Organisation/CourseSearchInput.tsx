import React, { useState } from 'react'
import { Autocomplete, TextField, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'
import { useOrganisationCourseSearch } from './useOrganisationCourseSearch'
import { useDebounce } from './useDebounce'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import { getSemesterRange } from '../../util/yearSemesterUtils'

type DateRange = { start: Date; end: Date }

type Locales = { fi: string; en: string; sv: string }

interface InitialValues {
  name: Locales
  startDate: Date
  endDate: Date
  studentNumbers: []
  teachers: []
  courses: []
}

type OrganisationCode = any

const CourseSearchInput = ({ organisationCode }: OrganisationCode) => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const formikProps = useFormikContext<InitialValues>()
  const [courseSearch, setCourseSearch] = useState('')
  const debounceSearch = useDebounce(courseSearch, 700)
  const [dateRange, setDateRange] = useState<DateRange>(() => getSemesterRange(new Date()))
  const [option, setOption] = React.useState<string>('semester')

  const { data } = useOrganisationCourseSearch({
    organisationCode,
    search: debounceSearch,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })

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
      <Grid xs={8} item>
        <Autocomplete
          id="courses"
          disableCloseOnSelect
          multiple
          defaultValue={formikProps.initialValues.courses}
          onChange={(_, courses) => {
            formikProps.setFieldValue('courses', courses)
          }}
          inputValue={courseSearch}
          onInputChange={(_, value) => {
            setCourseSearch(value)
          }}
          options={data ?? []}
          getOptionLabel={getOptionLabel}
          renderInput={(params: any) => (
            <TextField {...params} label={t('organisationSurveys:addCourses')} variant="outlined" />
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
    </>
  )
}

export default CourseSearchInput
