import React from 'react'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { TextFieldProps } from '@mui/material'

import TextField from './TextField'

type FormikTextFieldProps = Omit<TextFieldProps, 'name' | 'value' | 'error'> & {
  name: string
  showErrorInHelperText?: boolean
}

const FormikTextField = ({
  name,
  helperText,
  onBlur,
  showErrorInHelperText = true,
  ...props
}: FormikTextFieldProps) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = Boolean(meta.error) && meta.touched

  const handleBlur: TextFieldProps['onBlur'] = e => {
    helpers.setTouched(true)

    if (typeof onBlur === 'function') {
      onBlur(e)
    }
  }

  return (
    <TextField
      value={field.value ?? ''}
      onChange={event => helpers.setValue(event.target.value)}
      onBlur={handleBlur}
      error={showError}
      helperText={showErrorInHelperText && showError && meta.error ? t(meta.error) : helperText}
      slotProps={{
        formHelperText: {
          role: showErrorInHelperText && showError ? 'alert' : undefined,
        },
      }}
      {...props}
    />
  )
}

export default FormikTextField
