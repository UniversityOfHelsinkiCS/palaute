import React from 'react'

import { FormControl, FormGroup, FormControlLabel, Checkbox, FormHelperText } from '@mui/material'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'
import { useDelayedTouched } from './utils'
import { optionFocusIndicatorStyle } from '../../../../../util/accessibility'

const MultipleChoiceQuestion = ({ question, name, disabled }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { handleGroupBlur, handleGroupFocus } = useDelayedTouched(helpers.setTouched)

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

  const errorId = `${name.replace(/\./g, '-')}-error`
  const descriptionId = description ? `question-${question.id}-description` : undefined

  const ariaDescribedBy = [showError ? errorId : undefined, description ? descriptionId : undefined].filter(Boolean)

  return (
    <FormControl
      component="fieldset"
      aria-describedby={ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined}
      onBlur={handleGroupBlur}
      onFocus={handleGroupFocus}
    >
      <QuestionBase
        label={label}
        required={required}
        description={description}
        labelProps={{ component: 'legend', id: `question-${question.id}-legend` }}
        id={`question-${question.id}`}
      >
        <FormGroup role="group" aria-labelledby={`question-${question.id}-legend`} sx={{ paddingLeft: '0.75rem' }}>
          {options.map(option => (
            <FormControlLabel
              value={option.id}
              control={
                <Checkbox
                  checked={value.includes(option.id)}
                  onChange={handleChange}
                  color="primary"
                  name={option.id}
                  disabled={disabled}
                  disableFocusRipple
                />
              }
              label={getLanguageValue(option.label, language)}
              key={option.id}
              sx={{ pr: 1, ...optionFocusIndicatorStyle() }}
            />
          ))}
        </FormGroup>
        {showError && (
          <FormHelperText error id={errorId} role="alert" sx={{ ml: 2 }}>
            {t(meta.error)}
          </FormHelperText>
        )}
      </QuestionBase>
    </FormControl>
  )
}

export default MultipleChoiceQuestion
