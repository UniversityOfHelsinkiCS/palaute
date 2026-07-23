import type { RadioGroupProps } from '@mui/material'
import type { ReactNode } from 'react'

import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { useField } from 'formik'
import React from 'react'

import { optionFocusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type FormikRadioOption<T> = {
  value: T
  label: ReactNode
}

type FormikRadioButtonsProps<T> = Omit<RadioGroupProps, 'name' | 'value' | 'onChange' | 'onBlur'> & {
  name: string
  options: FormikRadioOption<T>[]
  valueMapper: (value: string) => T
  disabled?: boolean
}

const FormikRadioButtons = <T,>({ name, options, valueMapper, disabled, ...props }: FormikRadioButtonsProps<T>) => {
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
          sx={mergeSx({ pr: 1 }, optionFocusIndicatorStyle())}
        />
      ))}
    </RadioGroup>
  )
}

export default FormikRadioButtons
