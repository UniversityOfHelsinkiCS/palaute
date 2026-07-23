import { TextField as MuiTextField, TextFieldProps } from '@mui/material'

const TextField = (props: Omit<TextFieldProps, 'variant'>) => <MuiTextField variant="outlined" {...props} />

export default TextField
