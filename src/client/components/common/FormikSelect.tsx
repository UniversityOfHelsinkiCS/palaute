import type { SelectProps } from '@mui/material'
import type { ReactNode } from 'react'

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useField } from 'formik'
import React from 'react'

type FormikSelectOption = {
  value: string | number
  label: ReactNode
}

type FormikSelectProps = Omit<SelectProps, 'name' | 'value' | 'onChange' | 'options'> & {
  name: string
  label: ReactNode
  options: FormikSelectOption[]
}

const FormikSelect = ({ name, label, options, ...props }: FormikSelectProps) => {
  const [field, , helpers] = useField(name)

  return (
    <FormControl>
      <InputLabel id={name}>{label}</InputLabel>
      <Select
        label={label}
        variant="outlined"
        id={name}
        value={field.value}
        onChange={event => {
          helpers.setValue(event.target.value)
        }}
        onBlur={() => helpers.setTouched(true)}
        name={name}
        {...props}
      >
        {options.map(({ value, label: optionLabel }, idx) => (
          <MenuItem key={idx} value={value}>
            {optionLabel}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default FormikSelect
