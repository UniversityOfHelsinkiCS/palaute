import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { useField } from 'formik'
import React from 'react'

import { optionFocusIndicatorStyle } from '../../util/accessibility'

const FormikRadioButtons = ({ name, options, valueMapper = v => v, disabled, ...props }) => {
  const [field, , helpers] = useField(name)

  return (
    <RadioGroup
      value={field.value}
      onChange={event => {
        helpers.setValue(valueMapper(event.target.value))
      }}
      onBlur={() => helpers.setTouched(true)}
      name={name}
      color="primary"
      {...props}
    >
      {options.map(({ value, label }, idx) => (
        <FormControlLabel
          key={idx}
          value={value}
          control={<Radio disabled={disabled} disableFocusRipple />}
          label={label}
          sx={{ pr: 1, ...optionFocusIndicatorStyle() }}
        />
      ))}
    </RadioGroup>
  )
}

export default FormikRadioButtons
