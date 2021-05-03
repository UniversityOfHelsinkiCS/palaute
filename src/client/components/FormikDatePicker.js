import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import TextField from './TextField'

const FormikDatePicker = ({ name, helperText, label, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = meta.error && meta.touched

  return (
    <TextField
      type="date"
      label={label}
      value={field.value ?? ''}
      onChange={(event) => {
        helpers.setValue(event.target.value)
      }}
      onBlur={() => helpers.setTouched(true)}
      helperText={showError ? t(meta.error) : helperText}
      error={showError}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  )
}

export default FormikDatePicker
