import React from 'react'
import { useField } from 'formik'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

const FormikSelect = ({ name, label, options, ...props }) => {
  const [field, , helpers] = useField(name)

  return (
    <FormControl>
      <InputLabel id={name}>{label}</InputLabel>
      <Select
        label={label}
        variant="outlined"
        id={name}
        value={field.value}
        onChange={(event) => {
          helpers.setValue(event.target.value)
        }}
        onBlur={() => helpers.setTouched(true)}
        name={name}
        {...props}
      >
        {options.map(({ value, label }, idx) => (
          <MenuItem key={idx} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default FormikSelect
