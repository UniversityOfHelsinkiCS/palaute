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
      format="dd/MM/yyyy"
      id={field.name}
      value={new Date(field.value) ?? null}
      onChange={value => {
        setFieldValue(name, value, true)
      }}
      slots={{
        textField: TextField,
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          margin: 'normal',
          helperText: t(meta.error),
          error: showError,
          inputProps: {
            'data-cy': `formik-date-picker-field-${name}-input`,
          },
        },
        field: {
          'data-cy': `formik-date-picker-field-${name}`,
        },
        inputAdornment: {
          'data-cy': `formik-date-picker-keyboard-field-${name}`,
          'aria-label': 'change date',
        },
        openPickerButton: {
          'data-cy': `formik-date-picker-field-${name}-popper`,
        },
      }}
      maxDate={new Date('2300-01-01')}
      {...props}
    />
  )
}

export default FormikDatePicker
