import React from 'react'
import { useField } from 'formik'
import { Checkbox, FormControlLabel } from '@mui/material'

const FormikCheckbox = ({ name, label, ...props }) => {
  const [field, meta, helpers] = useField(name)

  const showError = meta.error && meta.touched

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={field.value}
          onChange={event => {
            helpers.setValue(event.target.checked)
          }}
          onBlur={() => helpers.setTouched(true)}
          error={showError}
          color="primary"
          {...props}
        />
      }
      label={label}
    />
  )
}

export default FormikCheckbox
