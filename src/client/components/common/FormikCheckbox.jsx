import React from 'react'
import { useField } from 'formik'
import { Checkbox, FormControlLabel, Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'

import { optionFocusIndicatorStyle } from '../../util/accessibility'

const FormikCheckbox = ({ name, label, ariaDescription, sx = {}, ...props }) => {
  const [field, meta, helpers] = useField(name)

  const showError = meta.error && meta.touched

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
            error={showError}
            color="primary"
            disableFocusRipple
            slotProps={{ input: { 'aria-describedby': ariaDescription ? 'checkbox-description' : undefined } }}
            {...props}
          />
        }
        label={label}
        sx={{ ...sx, pr: 1, ...optionFocusIndicatorStyle() }}
      />
    </>
  )
}

export default FormikCheckbox
