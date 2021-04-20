import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import TextField from './TextField'

const FormikTextField = ({ name, helperText, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = meta.error && meta.touched

  return (
    <TextField
      value={field.value ?? ''}
      onChange={(event) => helpers.setValue(event.target.value)}
      onBlur={() => helpers.setTouched(true)}
      error={showError}
      helperText={showError ? t(meta.error) : helperText}
      {...props}
    />
  )
}

export default FormikTextField
