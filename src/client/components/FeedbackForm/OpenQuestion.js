import React from 'react'
import { Typography, Box } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'
import { getLanguageValue } from '../../util/languageUtils'

const OpenQuestion = ({ question, name }) => {
  const { i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''
  const { required } = question
  const labelId = `${question.id}-label`

  return (
    <>
      <Box mb={1}>
        <Typography variant="h6" component="label" htmlFor={labelId}>
          {label}
          {required && ' *'}
        </Typography>
      </Box>
      <FormikTextField name={name} id={labelId} fullWidth multiline />
    </>
  )
}

export default OpenQuestion
