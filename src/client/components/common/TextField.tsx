import { TextField as MuiTextField, TextFieldProps } from '@mui/material'
import React from 'react'

const TextField = (props: Omit<TextFieldProps, 'variant'>) => <MuiTextField variant="outlined" {...props} />

export default TextField
