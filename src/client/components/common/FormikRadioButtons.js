import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { useField } from 'formik'
import React from 'react'

const FormikRadioButtons = ({
  name,
  options,
  valueMapper = (v) => v,
  ...props
}) => {
  const [field, , helpers] = useField(name)

  return (
    <RadioGroup
      value={field.value}
      onChange={(event) => {
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
          control={<Radio />}
          label={label}
        />
      ))}
    </RadioGroup>
  )
}

export default FormikRadioButtons
