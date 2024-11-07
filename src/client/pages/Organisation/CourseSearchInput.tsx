import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOrganisationCourseSearch } from './useOrganisationCourseSearch'

const CourseSearchInput = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [value, setValue] = useState<any>(null)
  const [filterValue, setFilterValue] = useState('')
  const [options, setOptions] = useState<any[]>([])
  const [selectedOptions, setSelectedOptions] = useState<any[]>([])
  const { code } = useParams<{ code: string }>()

  const { data, isLoading } = useOrganisationCourseSearch(
    code,
    filterValue.length > 2 ? filterValue : '',
    null,
    null
  )

  useEffect(() => {
    if (data) {
      const newOptions = data.flatMap((course: any) =>
        course.feedbackTargets.map((target: any) => ({
          ...course,
          courseRealisation: target.courseRealisation,
        }))
      )
      setOptions(newOptions)
    } else if (filterValue.length < 2) {
      setOptions([])
    }
  }, [data, filterValue])

  const handleValueChange = (event: any, newValue: any) => {
    if (newValue) {
      setSelectedOptions((prev) => [...prev, newValue])
    }
    setValue(null)
  }

  const handleInputChange = (event: any, newInputValue: string) => {
    setFilterValue(newInputValue)
  }

  const getOptionLabel = (option: any) =>
    option.courseRealisation.name[lang] || ''

  const renderInput = (params: any) => (
    <TextField {...params} label={t('Search for courses')} variant="outlined" />
  )

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

  const renderOption = (props: any, option: any) => {
    const { startDate, endDate } = getDates(option)

    return (
      <li {...props}>
        {option.courseRealisation.name[lang]} ({startDate} - {endDate})
      </li>
    )
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Autocomplete
        value={value}
        onChange={handleValueChange}
        inputValue={filterValue}
        onInputChange={handleInputChange}
        options={options}
        getOptionLabel={getOptionLabel}
        renderInput={renderInput}
        renderOption={renderOption}
      />
      <div>
        {selectedOptions.map((option) => {
          const { startDate, endDate } = getDates(option)
          return (
            <div key={`${option.id}-${option.courseRealisation.id}`}>
              {getOptionLabel(option)} ({startDate} - {endDate})
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CourseSearchInput
