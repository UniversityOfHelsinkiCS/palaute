import { TextFieldProps } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import TextField from './TextField'

type FormikTextFieldProps = Omit<TextFieldProps, 'name' | 'value' | 'error'> & {
  name: string
  showErrorInHelperText?: boolean
  // Accessible name and description in the user's language, for fields whose visible texts are in the language of the input
  accessibleLabel?: string
  accessibleHelperText?: string
}

const FormikTextField = ({
  name,
  helperText,
  onBlur,
  showErrorInHelperText = true,
  accessibleLabel,
  accessibleHelperText,
  slotProps,
  ...props
}: FormikTextFieldProps) => {
  const [field, meta, helpers] = useField(name)
  const { t } = useTranslation()

  const showError = Boolean(meta.error) && meta.touched
  const accessibleHelperTextId = accessibleHelperText && props.id ? `${props.id}-accessible-helper-text` : undefined
  // The accessible name must start with the visible label (WCAG 2.5.3 Label in Name)
  const ariaLabel =
    accessibleLabel && typeof props.label === 'string' && !accessibleLabel.startsWith(props.label)
      ? `${props.label}, ${accessibleLabel}`
      : accessibleLabel
  const describedBy = showError && props.id ? `${props.id}-helper-text` : accessibleHelperTextId

  const handleBlur: TextFieldProps['onBlur'] = e => {
    helpers.setTouched(true)

    if (typeof onBlur === 'function') {
      onBlur(e)
    }
  }

  return (
    <>
      <TextField
        value={field.value ?? ''}
        onChange={event => helpers.setValue(event.target.value)}
        onBlur={handleBlur}
        error={showError}
        helperText={showErrorInHelperText && showError && meta.error ? t(meta.error) : helperText}
        slotProps={{
          ...slotProps,
          formHelperText: {
            role: showErrorInHelperText && showError ? 'alert' : undefined,
          },
          htmlInput: {
            ...(ariaLabel && { 'aria-label': ariaLabel }),
            ...(accessibleHelperText && { 'aria-describedby': describedBy }),
          },
        }}
        {...props}
      />
      {accessibleHelperTextId && (
        <span id={accessibleHelperTextId} style={{ ...visuallyHidden, width: '0px', height: '0px' }}>
          {accessibleHelperText}
        </span>
      )}
    </>
  )
}

export default FormikTextField
