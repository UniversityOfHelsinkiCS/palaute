import React from 'react'
import { useField } from 'formik'

import TextField from './TextField'

const FormikTextField = ({ name, helperText, ...props }) => {
  const [field, meta, helpers] = useField(name)

  const showError = meta.error && meta.touched

  return (
    <TextField
      value={field.value ?? ''}
      onChange={(event) => helpers.setValue(event.target.value)}
      onBlur={() => helpers.setTouched()}
      error={showError}
      helperText={showError ? meta.error : helperText}
      {...props}
    />
  )
}

export default FormikTextField
