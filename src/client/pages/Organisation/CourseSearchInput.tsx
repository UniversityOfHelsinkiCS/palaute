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
    startDate: null,
    endDate: null,
  })
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])

  const getOptionLabel = (option: any) =>
    option.courseRealisation.name[lang] || ''
  const getDates = (option: any) => {
    const feedbackTarget = option.courseRealisation
    const startDate = feedbackTarget
      ? new Date(feedbackTarget.startDate).toLocaleDateString()
      : 'N/A'
    const endDate = feedbackTarget
      ? new Date(feedbackTarget.endDate).toLocaleDateString()
      : 'N/A'
    return { startDate, endDate }
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
        {selectedCourses.map((option) => {
          const { startDate, endDate } = getDates(option)
          return (
            <div key={`${option.id}-${option.courseRealisation?.id}`}>
              {getOptionLabel(option)} ({startDate} - {endDate})
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CourseSearchInput
