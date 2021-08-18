import React from 'react'
import { Box } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'

const OpenEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box mb={2}>
        <FormikTextField
          id={`open-question-${language}-${name}`}
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
        />
      </Box>

      <FormikTextField
        id={`open-description-${language}-${name}`}
        name={`${name}.data.description.${language}`}
        label={t('questionEditor:description')}
        helperText={t('questionEditor:descriptionHelper')}
        fullWidth
      />
    </>
  )
}

export default OpenEditor
