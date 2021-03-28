import React from 'react'

import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormHelperText,
} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { updateFormField } from '../util/redux/formReducer'
import { clearError } from '../util/redux/errorReducer'

const FormRadioButton = ({ number, answer }) => (
  <FormControlLabel
    value={number}
    control={<Radio color="primary" />}
    label={number}
    labelPlacement="top"
    checked={number === answer}
  />
)

const MultiChoiceQuestion = ({ question }) => {
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
    <div>
      <FormControl component="fieldset" error={error}>
        <h4>{question.question.fi}</h4>
        <RadioGroup row onChange={handleChange}>
          <FormRadioButton number="1" answer={answer} />
          <FormRadioButton number="2" answer={answer} />
          <FormRadioButton number="3" answer={answer} />
          <FormRadioButton number="4" answer={answer} />
          <FormRadioButton number="5" answer={answer} />
        </RadioGroup>
        <FormHelperText>{errorText()}</FormHelperText>
      </FormControl>
    </div>
  )
}

export default MultiChoiceQuestion
