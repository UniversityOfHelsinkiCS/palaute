import React, { useState } from 'react'
import { Autocomplete, TextField, Grid2 as Grid, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'
import { LocalizedString } from '@common/types'
import { useOrganisationCourseSearch } from './useOrganisationCourseSearch'
import { useDebounce } from './useDebounce'
import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import { getSemesterRange } from '../../util/semesterUtils'
import { getStartAndEndString } from '../../util/getDateRangeString'
import { getLanguageValue } from '../../util/languageUtils'
import { DateRange } from '../../types/DateRange'
import { CourseRealisation, FeedbackTarget } from '../../types'

export interface InitialValues {
  name: LocalizedString
  startDate: Date
  endDate: Date
  studentNumbers: []
  teachers: []
  courses: []
}

const CourseSearchInput = ({ organisationCode }: { organisationCode: string }) => {
  const { t, i18n } = useTranslation()
  const { language } = i18n
  const formikProps = useFormikContext<InitialValues>()
  const [courseSearch, setCourseSearch] = useState('')
  const debounceSearch = useDebounce(courseSearch, 700)
  const [dateRange, setDateRange] = useState<DateRange>(() => getSemesterRange(new Date()))
  const [rangeOption, setRangeOption] = React.useState<string>('semester')

  const { data } = useOrganisationCourseSearch({
    organisationCode,
    search: debounceSearch,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })

  const options = data
    ?.flatMap(({ feedbackTargets }: { feedbackTargets: FeedbackTarget[] }) =>
      feedbackTargets.map(feedbackTarget => feedbackTarget.courseRealisation)
    )
    .sort((a: CourseRealisation, b: CourseRealisation) =>
      a.name[language as keyof LocalizedString]?.localeCompare(b.name[language as keyof LocalizedString] ?? '')
    )

  const getOptionLabel = (course: CourseRealisation) => {
    const [startDate, endDate] = getStartAndEndString(course?.startDate, course?.endDate)
    const courseName = getLanguageValue(course?.name, language)
    return `${courseName || ''} (${startDate} - ${endDate})`
  }

  const handleDateRangeChange = (nextDateRange: DateRange) => {
    setDateRange(nextDateRange)
  }

  return (
    <>
      <Grid size={10}>
        <Autocomplete
          id="courses"
          disableCloseOnSelect
          multiple
          defaultValue={formikProps.initialValues.courses}
          onChange={(_, courses, reason, detail) => {
            if (
              reason === 'removeOption' &&
              !window.confirm(
                t('organisationSurveys:removeCourse', {
                  course: detail?.option,
                })
              )
            )
              return
            formikProps.setFieldValue('courses', courses)
          }}
          inputValue={courseSearch}
          onInputChange={(_, value) => {
            setCourseSearch(value)
          }}
          options={options ?? []}
          getOptionLabel={getOptionLabel}
          renderInput={params => (
            <TextField {...params} label={t('organisationSurveys:addCourses')} variant="outlined" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                data-cy={`formik-course-input-field-chip-${option.id}`}
                label={getOptionLabel(option)}
                key={`${option.id}-${index}`}
              />
            ))
          }
        />
      </Grid>
      <Grid size={2}>
        <YearSemesterPeriodSelector
          value={dateRange ?? { start: new Date(), end: new Date() }}
          onChange={handleDateRangeChange}
          option={rangeOption}
          futureYears={0}
          setOption={setRangeOption}
          allowAll={false}
        />
      </Grid>
    </>
  )
}

export default CourseSearchInput
