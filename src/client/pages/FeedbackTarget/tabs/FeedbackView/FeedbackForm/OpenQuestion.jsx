import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { FormHelperText } from '@mui/material'

import FormikTextField from '../../../../../components/common/FormikTextField'
import { getLanguageValue } from '../../../../../util/languageUtils'
import QuestionBase from './QuestionBase'

const OpenQuestion = ({ question, name, disabled }) => {
  const [, meta] = useField(name)
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const label = getLanguageValue(question.data?.label, language) ?? ''
  const { required } = question
  const inputId = `${question.id}-input`

  const description = getLanguageValue(question.data?.description, language) ?? ''

  const showError = meta.error && meta.touched
  const errorId = `${name.replace(/\./g, '-')}-error`

  const ariaDescribedBy = [
    showError ? errorId : undefined,
    description ? `question-${question.id}-description` : undefined,
  ].filter(Boolean)

  return (
    <QuestionBase
      label={label}
      required={required}
      description={description}
      labelProps={{ component: 'label', htmlFor: inputId }}
      id={`question-${question.id}`}
    >
      <FormikTextField
        name={name}
        id={inputId}
        disabled={disabled}
        fullWidth
        multiline
        required={required}
        showErrorInHelperText={false}
        slotProps={{
          input: {
            'aria-describedby': ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined,
          },
        }}
      />
      {showError && (
        <FormHelperText error id={errorId} role="alert">
          {t(meta.error)}
        </FormHelperText>
      )}
    </QuestionBase>
  )
}

export default OpenQuestion
