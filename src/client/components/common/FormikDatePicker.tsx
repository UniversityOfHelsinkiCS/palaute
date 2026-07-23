import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker'

import { TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useField, useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'

type FormikDatePickerProps = Omit<
  DatePickerProps<Date>,
  'value' | 'onChange' | 'format' | 'maxDate' | 'slots' | 'slotProps'
> & {
  name: string
}

type DatePickerSlotProps = DatePickerProps<Date>['slotProps']

const FormikDatePicker = ({ name, ...props }: FormikDatePickerProps) => {
  const [field, meta] = useField(name)
  const { setFieldValue } = useFormikContext()
  const { t } = useTranslation()

  const showError = Boolean(meta.error)

  return (
    <DatePicker
      format="dd/MM/yyyy"
      value={field.value ? new Date(field.value) : null}
      onChange={value => {
        setFieldValue(name, value, true)
      }}
      slots={{
        textField: TextField,
      }}
      slotProps={{
        textField: {
          id: field.name,
          fullWidth: true,
          margin: 'normal',
          helperText: t(meta.error),
          error: showError,
          slotProps: {
            formHelperText: {
              role: showError ? 'alert' : undefined,
            },
          },
          inputProps: {
            'data-cy': `formik-date-picker-field-${name}-input`,
          },
        },
        // These three slots' MUI prop types don't include `data-cy` (only used for Cypress
        // selectors, has no runtime meaning to MUI), so a cast to the real slot prop type is
        // needed to attach it.
        field: {
          'data-cy': `formik-date-picker-field-${name}`,
        } as DatePickerSlotProps['field'],
        inputAdornment: {
          'data-cy': `formik-date-picker-keyboard-field-${name}`,
          'aria-label': 'change date',
        } as DatePickerSlotProps['inputAdornment'],
        openPickerButton: {
          'data-cy': `formik-date-picker-field-${name}-popper`,
        } as DatePickerSlotProps['openPickerButton'],
      }}
      maxDate={new Date('2300-01-01')}
      {...props}
    />
  )
}

export default FormikDatePicker
