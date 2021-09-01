import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { DatePicker } from '@material-ui/pickers'

const FormikDatePicker = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = meta.error && meta.touched

  return (
    <DatePicker
      format="dd/MMM/yyyy"
      margin="normal"
      id={name}
      value={field.value ?? ''}
      onChange={(value) => {
        helpers.setValue(value)
      }}
      onBlur={() => helpers.setTouched(true)}
      error={showError}
      helperText={showError ? t(meta.error) : ''}
      inputVariant="outlined"
      {...props}
    />
  )
}

export default FormikDatePicker
