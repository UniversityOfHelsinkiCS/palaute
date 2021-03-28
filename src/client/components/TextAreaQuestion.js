import React from 'react'
import { TextField } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { updateFormField } from '../util/redux/formReducer'

import { clearError } from '../util/redux/errorReducer'

const TextAreaQuestion = ({ question }) => {
  const dispatch = useDispatch()
  const answer = useSelector((state) => state.form[question.id])
  const error = useSelector((state) => state.error[question.id])

  const handleChange = (event) => {
    event.preventDefault()
    dispatch(updateFormField(question.id, event.target.value))
    if (error) {
      dispatch(clearError(question.id))
    }
  }

  const errorText = () => {
    if (!error) return null
    return 'Tämä kenttä on pakollinen'
  }

  return (
    <>
      <h4>{question.question.fi}</h4>
      <TextField
        error={error}
        helperText={errorText()}
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
