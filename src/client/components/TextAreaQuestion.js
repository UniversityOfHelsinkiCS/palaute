import React from 'react'
import { TextField } from '@material-ui/core'

const TextAreaQuestion = ({
  question,
  answer,
  handleChange,
  error,
  errorText,
}) => (
  <>
    <h4>{question}</h4>
    <TextField
      error={error}
      helperText={errorText}
      fullWidth
      multiline
      margin="normal"
      variant="outlined"
      value={answer}
      onChange={handleChange}
    />
  </>
)

export default TextAreaQuestion
