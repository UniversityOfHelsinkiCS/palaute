import React from 'react'

import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'

const OpenEditor = ({ name, language }) => {
  const { t } = useTranslation()

  return (
    <FormikTextField
      name={`${name}.data.label.${language}`}
      label={t('questionEditor:label')}
      fullWidth
    />
  )
}

export default OpenEditor
