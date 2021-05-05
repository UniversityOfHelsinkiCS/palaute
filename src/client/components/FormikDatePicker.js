import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'

import DateFnsUtils from '@date-io/date-fns'

const FormikDatePicker = ({ name, label, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = meta.error && meta.touched

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        variant="inline"
        format="dd/MMM/yyyy"
        margin="normal"
        id={name}
        label={label}
        value={field.value ?? ''}
        onChange={(value) => {
          helpers.setValue(value)
        }}
        error={showError}
        helperText={showError ? t(meta.error) : ''}
        {...props}
      />
    </MuiPickersUtilsProvider>
  )
}

export default FormikDatePicker
