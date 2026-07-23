import type { SwitchProps } from '@mui/material'
import type { ReactNode } from 'react'

import { Switch, FormControlLabel } from '@mui/material'
import { useField } from 'formik'

import { switchFocusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type FormikSwitchProps = Omit<SwitchProps, 'name' | 'checked' | 'onChange'> & {
  name: string
  label: ReactNode
}

const FormikSwitch = ({ name, label, sx, ...props }: FormikSwitchProps) => {
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
          sx={mergeSx(sx, switchFocusIndicatorStyle)}
          disableRipple
          {...props}
        />
      }
      label={label}
    />
  )
}

export default FormikSwitch
