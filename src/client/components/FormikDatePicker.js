import React from 'react'
import { useField } from 'formik'
import { TextField } from '@material-ui/core'

const FormikDatePicker = ({ name, helperText, label, ...props }) => {
  const [field, meta, helpers] = useField(name)

  const showError = meta.error && meta.touched

  return (
    <TextField
      type="datetime-local"
      label={label}
      value={field.value ?? ''}
      onChange={(event) => {
        helpers.setValue(event.target.value)
      }}
      onBlur={() => helpers.setTouched()}
      helperText={showError ? meta.error : helperText}
      error={showError}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  )
}

export default FormikDatePicker
