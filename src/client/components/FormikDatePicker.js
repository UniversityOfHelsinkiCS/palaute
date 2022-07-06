import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const FormikDatePicker = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = meta.error && meta.touched

  return (
    <DatePicker
      inputFormat="dd/MM/yyyy"
      id={name}
      value={field.value ?? ''}
      onChange={(value) => {
        helpers.setValue(value)
      }}
      onBlur={() => helpers.setTouched(true)}
      renderInput={(props) => (
        <TextField fullWidth margin="normal" {...props} />
      )}
      error={showError}
      helperText={showError ? t(meta.error) : ''}
      KeyboardButtonProps={{
        'aria-label': 'change date',
      }}
      inputVariant="outlined"
      disableToolbar
      maxDate={new Date('2300-01-01')}
      {...props}
    />
  )
}

export default FormikDatePicker
