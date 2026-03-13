import React from 'react'
import { useField } from 'formik'
import { Checkbox, FormControlLabel, Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'

const FormikCheckbox = ({ name, label, ariaDescription, ...props }) => {
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
            slotProps={{ input: { 'aria-describedby': ariaDescription ? 'checkbox-description' : undefined } }}
            {...props}
          />
        }
        label={label}
      />
    </>
  )
}

export default FormikCheckbox
