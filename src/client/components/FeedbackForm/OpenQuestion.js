import React from 'react'

import FormikTextField from '../FormikTextField'
import { getLanguageValue } from '../../util/languageUtils'
import useLanguage from '../../hooks/useLanguage'
import QuestionBase from './QuestionBase'

const OpenQuestion = ({ question, name }) => {
  const language = useLanguage()
  const label = getLanguageValue(question.data?.label, language) ?? ''
  const { required } = question
  const labelId = `${question.id}-label`

  const description =
    getLanguageValue(question.data?.description, language) ?? ''

  return (
    <QuestionBase
      label={label}
      required={required}
      description={description}
      labelProps={{ component: 'label', htmlFor: labelId }}
    >
      <FormikTextField name={name} id={labelId} fullWidth multiline />
    </QuestionBase>
  )
}

export default OpenQuestion
