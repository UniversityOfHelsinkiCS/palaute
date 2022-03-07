import React, { useState } from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { KeyboardDatePicker } from '@material-ui/pickers'

const FormikDatePicker = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = meta.error && meta.touched

  return (
    <>
      <KeyboardDatePicker
        format="dd/MM/yyyy"
        variant="inline"
        margin="normal"
        id={name}
        value={field.value ?? ''}
        onChange={(value) => {
          helpers.setValue(value)
        }}
        onBlur={() => helpers.setTouched(true)}
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
    </>
  )
}

export default FormikDatePicker
