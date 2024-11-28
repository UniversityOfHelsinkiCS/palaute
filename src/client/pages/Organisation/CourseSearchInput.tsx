import React, { useState } from 'react'
import { Autocomplete, TextField, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'
import { useOrganisationCourseSearch } from './useOrganisationCourseSearch'
import { useDebounce } from './useDebounce'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import { getSemesterRange } from '../../util/yearSemesterUtils'
import { getStartAndEndString } from '../../util/getDateRangeString'
import { getLanguageValue } from '../../util/languageUtils'

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

type OrganisationCode = string

const CourseSearchInput = ({ organisationCode }: { organisationCode: OrganisationCode }) => {
  const { t, i18n } = useTranslation()
  const { language } = i18n
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
    const [startDate, endDate] = getStartAndEndString(courseRealisation.startDate, courseRealisation.endDate)
    const courseName = getLanguageValue(course?.name, language)
    return `${courseName || ''} (${startDate} - ${endDate})`
  }

  const handleDateRangeChange = (nextDateRange: DateRange) => {
    setDateRange(nextDateRange)
  }

  return (
    <>
      <Grid xs={10} item>
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
          renderInput={params => (
            <TextField {...params} label={t('organisationSurveys:addCourses')} variant="outlined" />
          )}
        />
      </Grid>
      <Grid xs={2} item>
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
