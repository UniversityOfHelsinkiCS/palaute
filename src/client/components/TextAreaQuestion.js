import React from 'react'
import { TextField } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { updateFormField } from '../util/redux/formReducer'

const TextAreaQuestion = ({ question }) => {
  const dispatch = useDispatch()
  const answer = useSelector((state) => state.form[question.id])

  const handleChange = (event) => {
    event.preventDefault()
    dispatch(updateFormField(question.id, event.target.value))
  }

  return (
    <>
      <h4>{question.question.fi}</h4>
      <TextField
        fullWidth
        multiline
        margin="normal"
        variant="outlined"
        value={answer}
        onChange={handleChange}
      />
    </>
  )
}

export default TextAreaQuestion
