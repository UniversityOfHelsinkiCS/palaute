import React from 'react'
import { DesktopDatePicker, DatePicker as MuiDatePicker } from '@mui/lab'
import { TextField } from '@mui/material'

export const KeyboardDatePicker = ({ value, onChange, ...props }) => (
  <DesktopDatePicker
    inputFormat="dd/MM/yyyy"
    value={value}
    onChange={onChange}
    KeyboardButtonProps={{
      'aria-label': 'change date',
    }}
    inputVariant="outlined"
    disableToolbar
    maxDate={new Date('2300-01-01')}
    renderInput={(props) => <TextField margin="normal" {...props} />}
    {...props}
  />
)

export const DatePicker = ({ value, onChange, ...props }) => (
  <MuiDatePicker
    inputFormat="dd/MM/yyyy"
    margin="normal"
    value={value}
    onChange={onChange}
    inputVariant="outlined"
    disableToolbar
    maxDate={new Date('2300-01-01')}
    renderInput={(props) => <TextField margin="normal" {...props} />}
    {...props}
  />
)
