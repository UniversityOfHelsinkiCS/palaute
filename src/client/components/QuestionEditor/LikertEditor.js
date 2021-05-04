import React from 'react'
import { Box } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'

const LikertEditor = ({ name, language }) => {
  const { t } = useTranslation()

  return (
    <>
      <Box mb={2}>
        <FormikTextField
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
        />
      </Box>

      <FormikTextField
        name={`${name}.data.description.${language}`}
        label={t('questionEditor:description')}
        fullWidth
      />
    </>
  )
}

export default LikertEditor
