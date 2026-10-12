import type { TextFieldProps } from '@mui/material'

import { TextField } from '@mui/material'
import { useEffect, useState } from 'react'

const DELAY_MS = 300

type DebouncedTextFieldProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
}

// A text filter that applies after a pause in typing, so each keystroke doesn't start a query
const DebouncedTextField = ({ value, onChange, ...props }: DebouncedTextFieldProps) => {
  const [draft, setDraft] = useState(value)
  const [applied, setApplied] = useState(value)

  // The value changed from outside, e.g. Clear filters or Back
  if (value !== applied) {
    setApplied(value)
    setDraft(value)
  }

  useEffect(() => {
    if (draft === value) return undefined
    const timer = window.setTimeout(() => onChange(draft), DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [draft, value, onChange])

  return <TextField {...props} value={draft} onChange={event => setDraft(event.target.value)} />
}

export default DebouncedTextField
