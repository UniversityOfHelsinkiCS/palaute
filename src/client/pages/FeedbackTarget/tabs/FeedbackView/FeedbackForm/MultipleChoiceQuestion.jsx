import React from 'react'

import { FormControl, FormGroup, FormControlLabel, Checkbox, FormHelperText } from '@mui/material'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'

const MultipleChoiceQuestion = ({ question, name, disabled }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const value = answer ?? []
  const options = question.data?.options ?? []
  const { required } = question
  const showError = meta.error && meta.touched

  const handleChange = event => {
    const { name, checked } = event.target

    const newValue = checked ? [...value, name] : value.filter(n => n !== name)

    helpers.setValue(newValue)
  }

  return (
    <>
      <FormControl component="fieldset">
        <QuestionBase label={label} required={required} description={description} labelProps={{ component: 'legend' }}>
          <FormGroup sx={{ paddingLeft: '0.75rem' }}>
            {options.map(option => (
              <FormControlLabel
                value={option.id}
                control={
                  <Checkbox
                    checked={value.includes(option.id)}
                    onChange={handleChange}
                    onBlur={() => helpers.setTouched(true)}
                    color="primary"
                    name={option.id}
                    disabled={disabled}
                  />
                }
                label={getLanguageValue(option.label, language)}
                key={option.id}
              />
            ))}
          </FormGroup>
        </QuestionBase>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default MultipleChoiceQuestion
