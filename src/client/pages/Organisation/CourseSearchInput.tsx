import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOrganisationCourseSearch } from './useOrganisationCourseSearch'
import { useDebounce } from './useDebounce'

const CourseSearchInput = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const { code } = useParams<{ code: string }>()
  const [courseSearch, setCourseSearch] = useState('')
  const debounceSearch = useDebounce(courseSearch, 700)
  const { data: courses } = useOrganisationCourseSearch({
    organisationCode: code,
    search: debounceSearch,
    startDate: new Date('2022-09-06T00:00:00.000Z'),
    endDate: new Date('2022-10-21T20:59:00.000Z'),
  })
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])

  const getOptionLabel = (option: any) => {
    const courseRealisation = option.feedbackTargets[0]?.courseRealisation
    const startDate = courseRealisation?.startDate
      ? new Date(courseRealisation.startDate).toLocaleDateString()
      : ''
    const endDate = courseRealisation?.endDate
      ? new Date(courseRealisation.endDate).toLocaleDateString()
      : ''
    return `${option?.name[lang] || ''} (${startDate} - ${endDate})`
  }

  return (
    <div>
      <Autocomplete
        disableCloseOnSelect
        multiple
        disablePortal
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
            label={t('Search for courses')}
            variant="outlined"
          />
        )}
      />
      <div>
        {selectedCourses.map((option) => (
          <div key={option.courseRealisationId}>{getOptionLabel(option)}</div>
        ))}
      </div>
    </div>
  )
}

export default CourseSearchInput
