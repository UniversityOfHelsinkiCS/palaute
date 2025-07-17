import React from 'react'

import { FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'
import { getDontKnowOption } from './utils'

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

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const showError = meta.error && meta.touched
  const { required } = question
  const value = answer ?? ''

  const parseOption = option => {
    if (option !== 0) return option.toString()

    return getDontKnowOption(question.data.label, language)
  }

  return (
    <>
      <FormControl component="fieldset">
        <QuestionBase label={label} required={required} description={description} labelProps={{ component: 'legend' }}>
          <RadioGroup
            aria-label={label}
            value={value}
            onChange={event => {
              helpers.setValue(event.target.value)
            }}
            onBlur={() => helpers.setTouched(true)}
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
        </QuestionBase>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default LikertQuestion
