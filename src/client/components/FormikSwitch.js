import React from 'react'
import { useField } from 'formik'
import { Switch, FormControlLabel } from '@material-ui/core'

const FormikSwitch = ({ name, label, ...props }) => {
  const [field, , helpers] = useField(name)

  return (
    <FormControlLabel
      control={
        <Switch
          checked={field.value}
          onChange={(event) => {
            helpers.setValue(event.target.checked)
          }}
          onBlur={() => helpers.setTouched(true)}
          name={name}
          color="primary"
          {...props}
        />
      }
      label={label}
    />
  )
}

export default FormikSwitch
