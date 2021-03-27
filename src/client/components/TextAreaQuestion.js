import React from 'react'
import { TextField } from '@material-ui/core'

const TextAreaQuestion = ({ question }) => {
  const handleChange = (e) => {
    e.preventDefault()
  }

  return (
    <>
      <h4>{question.question.fi}</h4>
      <TextField
        fullWidth
        multiline
        margin="normal"
        variant="outlined"
        onChange={handleChange}
      />
    </>
  )
}

export default TextAreaQuestion
