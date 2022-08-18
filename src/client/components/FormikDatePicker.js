import React from 'react'
import { useField, useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const FormikDatePicker = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { setFieldValue } = useFormikContext()
  const { t } = useTranslation()

  const showError = Boolean(meta.error)

  console.log(showError)

  return (
    <DatePicker
      inputFormat="dd/MM/yyyy"
      id={name}
      value={field.value ?? ''}
      onChange={(value) => {
        setFieldValue(name, value, true)
        console.log('changed')
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
