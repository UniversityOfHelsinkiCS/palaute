import React from 'react'

import { FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material'

import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'

const GroupingQuestion = ({ question, name }) => {
  const [{ value: answer }, meta, helpers] = useField(name)
  const { t, i18n } = useTranslation()
  const { language } = i18n

  const label = getLanguageValue(question.data?.label, language) ?? ''

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const value = answer ?? ''
  const options = question.data?.options ?? []
  const { required } = question
  const showError = meta.error && meta.touched

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
            sx={{ paddingLeft: '0.8rem' }}
          >
            {options.map(option => (
              <FormControlLabel
                value={option.id}
                control={<Radio color="primary" />}
                label={getLanguageValue(option.label, language)}
                key={option.id}
              />
            ))}
          </RadioGroup>
        </QuestionBase>
      </FormControl>
      {showError && <FormHelperText error>{t(meta.error)}</FormHelperText>}
    </>
  )
}

export default GroupingQuestion
