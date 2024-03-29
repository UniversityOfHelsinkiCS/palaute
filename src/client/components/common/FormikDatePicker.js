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
      id={field.name}
      value={field.value ?? ''}
      onChange={value => {
        setFieldValue(name, value, true)
      }}
      renderInput={params => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps, 'data-cy': `formik-date-picker-field-${name}-input` }}
          fullWidth
          margin="normal"
          helperText={t(meta.error)}
          error={showError}
        />
      )}
      error={showError}
      InputProps={{
        'data-cy': `formik-date-picker-field-${name}`,
      }}
      KeyboardButtonProps={{
        'data-cy': `formik-date-picker-keyboard-field-${name}`,
        'aria-label': 'change date',
      }}
      OpenPickerButtonProps={{
        'data-cy': `formik-date-picker-field-${name}-popper`,
      }}
      inputVariant="outlined"
      disableToolbar
      maxDate={new Date('2300-01-01')}
      {...props}
    />
  )
}

export default FormikDatePicker
