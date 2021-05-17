import React from 'react'

import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'

const TextEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <FormikTextField
      name={`${name}.data.content.${language}`}
      label={t('questionEditor:content')}
      fullWidth
      multiline
    />
  )
}

export default TextEditor
