import React from 'react'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'
import { getLanguageValue } from '../../util/languageUtils'
import QuestionBase from './QuestionBase'

const OpenQuestion = ({ question, name }) => {
  const { i18n } = useTranslation()
  const { language } = i18n
  const label = getLanguageValue(question.data?.label, language) ?? ''
  const { required } = question
  const labelId = `${question.id}-label`

  const description = getLanguageValue(question.data?.description, language) ?? ''

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
