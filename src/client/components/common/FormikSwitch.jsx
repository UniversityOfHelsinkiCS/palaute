import React from 'react'
import { useField } from 'formik'
import { Switch, FormControlLabel } from '@mui/material'

import { switchFocusIndicatorStyle } from '../../util/accessibility'

const FormikSwitch = ({ name, label, sx, ...props }) => {
  const [field, , helpers] = useField(name)

  return (
    <FormControlLabel
      control={
        <Switch
          checked={field.value}
          onChange={event => {
            helpers.setValue(event.target.checked)
          }}
          onBlur={() => helpers.setTouched(true)}
          name={name}
          color="primary"
          sx={{ ...(sx ?? {}), ...switchFocusIndicatorStyle }}
          disableRipple
          {...props}
        />
      }
      label={label}
    />
  )
}

export default FormikSwitch
