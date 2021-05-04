import React from 'react'

import { Box } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import OptionEditor from './OptionEditor'
import FormikTextField from '../FormikTextField'

const ChoiceEditor = ({ name, language }) => {
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

      <Box mb={2}>
        <FormikTextField
          name={`${name}.data.description.${language}`}
          label={t('questionEditor:description')}
          fullWidth
        />
      </Box>

      <OptionEditor name={`${name}.data.options`} language={language} />
    </>
  )
}

export default ChoiceEditor
