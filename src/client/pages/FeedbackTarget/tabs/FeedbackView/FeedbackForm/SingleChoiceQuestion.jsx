import React from 'react'

import { FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'
import { useDelayedTouched } from './utils'

const SingleChoiceQuestion = ({ question, name, disabled }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { t, i18n } = useTranslation()
  const { language } = i18n

  const { handleGroupBlur, handleGroupFocus } = useDelayedTouched(helpers.setTouched)

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const value = answer ?? ''
  const options = question.data?.options ?? []
  const { required } = question
  const showError = meta.error && meta.touched

  const errorId = `${name.replace(/\./g, '-')}-error`

  return (
    <>
      <FormControl
        component="fieldset"
        aria-describedby={showError ? errorId : undefined}
        onBlur={handleGroupBlur}
        onFocus={handleGroupFocus}
      >
        <QuestionBase
          label={label}
          required={required}
          description={description}
          labelProps={{ component: 'legend' }}
          id={`question-${question.id}`}
        >
          <RadioGroup
            aria-label={label}
            value={value}
            onChange={event => {
              helpers.setValue(event.target.value)
            }}
            sx={{ paddingLeft: '0.8rem' }}
          >
            {options.map(option => (
              <FormControlLabel
                value={option.id}
                control={<Radio color="primary" />}
                label={getLanguageValue(option.label, language)}
                key={option.id}
                disabled={disabled}
              />
            ))}
          </RadioGroup>
        </QuestionBase>
      </FormControl>
      {showError && (
        <FormHelperText error id={errorId} role="alert">
          {t(meta.error)}
        </FormHelperText>
      )}
    </>
  )
}

export default SingleChoiceQuestion
