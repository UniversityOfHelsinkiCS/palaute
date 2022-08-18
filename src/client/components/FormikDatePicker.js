import React from 'react'
import { useField, useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const FormikDatePicker = ({ name, ...props }) => {
  const [field, meta] = useField(name)
  const { setFieldValue } = useFormikContext()
  const { t } = useTranslation()

  const showError = Boolean(meta.error)

  return (
    <DatePicker
      inputFormat="dd/MM/yyyy"
      id={name}
      value={field.value ?? ''}
      onChange={(value) => {
        setFieldValue(name, value, true)
      }}
      renderInput={(props) => (
        <TextField
          fullWidth
          margin="normal"
          {...props}
          helperText={t(meta.error)}
          error={showError}
        />
      )}
      error={showError}
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
