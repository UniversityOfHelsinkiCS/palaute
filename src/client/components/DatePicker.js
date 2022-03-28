import React from 'react'
import {
  KeyboardDatePicker as MuiKeyboardDatePicker,
  DatePicker as MuiDatePicker,
} from '@material-ui/pickers'

export const KeyboardDatePicker = ({ value, onChange, ...props }) => (
  <MuiKeyboardDatePicker
    format="dd/MM/yyyy"
    variant="inline"
    margin="normal"
    value={value}
    onChange={onChange}
    KeyboardButtonProps={{
      'aria-label': 'change date',
    }}
    inputVariant="outlined"
    disableToolbar
    maxDate={new Date('2300-01-01')}
    {...props}
  />
)

export const DatePicker = ({ value, onChange, ...props }) => (
  <MuiDatePicker
    format="dd/MM/yyyy"
    variant="inline"
    margin="normal"
    value={value}
    onChange={onChange}
    inputVariant="outlined"
    disableToolbar
    maxDate={new Date('2300-01-01')}
    {...props}
  />
)
