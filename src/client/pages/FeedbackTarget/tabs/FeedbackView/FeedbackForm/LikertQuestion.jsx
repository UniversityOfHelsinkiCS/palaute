import React from 'react'

import { FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'
import { getDontKnowOption, useDelayedTouched } from './utils'

const styles = {
  optionLabel: {
    marginLeft: theme => theme.spacing(0.2),
    marginRight: theme => theme.spacing(0.2),
  },
  dontKnowLabel: {
    marginLeft: theme => theme.spacing(1),
    marginRight: theme => theme.spacing(0.5),
  },
}

const options = [1, 2, 3, 4, 5, 0]

const LikertQuestion = ({ question, name, disabled }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { handleGroupBlur, handleGroupFocus } = useDelayedTouched(helpers.setTouched)

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const showError = meta.error && meta.touched
  const { required } = question
  const value = answer ?? ''

  const parseOption = option => {
    if (option !== 0) return option.toString()

    return getDontKnowOption(question.data.label, language)
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
        <RadioGroup
          aria-labelledby={`question-${question.id}-legend`}
          value={value}
          onChange={event => {
            helpers.setValue(event.target.value)
          }}
          row
        >
          {options.map(option => (
            <FormControlLabel
              labelPlacement="top"
              value={option.toString()}
              control={<Radio color="primary" />}
              label={parseOption(option)}
              key={option}
              sx={option !== 0 ? styles.optionLabel : styles.dontKnowLabel}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
        {showError && (
          <FormHelperText error id={errorId} role="alert" sx={{ ml: 2 }}>
            {t(meta.error)}
          </FormHelperText>
        )}
      </QuestionBase>
    </FormControl>
  )
}

export default LikertQuestion
