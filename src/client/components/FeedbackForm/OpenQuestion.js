import React from 'react'
import { Typography, Box } from '@material-ui/core'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'
import { getLanguageValue } from '../../util/languageUtils'

const OpenQuestion = ({ name }) => {
  const [{ value: question }] = useField(name)
  const { i18n } = useTranslation()
  const label = getLanguageValue(question.data?.label, i18n.language) ?? ''

  const labelId = `${question.id}-label`

  return (
    <>
      <Box mb={1}>
        <Typography variant="h6" component="label" htmlFor={labelId}>
          {label}
        </Typography>
      </Box>
      <FormikTextField
        name={`${name}.answer`}
        id={labelId}
        fullWidth
        multiline
      />
    </>
  )
}

export default OpenQuestion
