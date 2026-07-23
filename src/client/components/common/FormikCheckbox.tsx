import { Checkbox, CheckboxProps, FormControlLabel, Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useField } from 'formik'
import React from 'react'

import { optionFocusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type FormikCheckboxProps = Omit<CheckboxProps, 'name' | 'checked'> & {
  name: string
  label: React.ReactNode
  ariaDescription?: string
}

const FormikCheckbox = ({ name, label, ariaDescription, sx = {}, ...props }: FormikCheckboxProps) => {
  const [field, , helpers] = useField(name)

  return (
    <>
      {ariaDescription && (
        <Box component="span" id="checkbox-description" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
          {ariaDescription}
        </Box>
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={field.value}
            onChange={event => {
              helpers.setValue(event.target.checked)
            }}
            onBlur={() => helpers.setTouched(true)}
            color="primary"
            disableFocusRipple
            slotProps={{ input: { 'aria-describedby': ariaDescription ? 'checkbox-description' : undefined } }}
            {...props}
          />
        }
        label={label}
        sx={mergeSx(sx, { pr: 1 }, optionFocusIndicatorStyle())}
      />
    </>
  )
}

export default FormikCheckbox
