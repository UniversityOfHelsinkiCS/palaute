import React, { useState } from 'react'
import { Autocomplete, TextField, Grid2 as Grid, Chip } from '@mui/material'
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

type CourseRealisation = {
  id: string
  name: Locales
  startDate: string
  endDate: string
}

type FeedbackTarget = {
  id: number
  courseRealisationId: string
  courseRealisation: CourseRealisation
}

type FeedbackTargets = FeedbackTarget[]

const CourseSearchInput = ({ organisationCode }: { organisationCode: OrganisationCode }) => {
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
    ?.flatMap(({ feedbackTargets }: { feedbackTargets: FeedbackTargets }) =>
      feedbackTargets.map(feedbackTarget => feedbackTarget.courseRealisation)
    )
    .sort((a: CourseRealisation, b: CourseRealisation) =>
      a.name[language as keyof Locales].localeCompare(b.name[language as keyof Locales])
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
        <YearSemesterSelector
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
