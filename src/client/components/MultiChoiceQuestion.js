import React from 'react'

import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormHelperText,
} from '@material-ui/core'

const FormRadioButton = ({ number, answer }) => (
  <FormControlLabel
    value={number}
    control={<Radio color="primary" />}
    label={number}
    labelPlacement="top"
    checked={number === answer}
  />
)

const MultiChoiceQuestion = ({
  question,
  answer,
  handleChange,
  error,
  errorText,
}) => (
  <div>
    <FormControl component="fieldset" error={error}>
      <h4>{question}</h4>
      <RadioGroup row onChange={handleChange}>
        <FormRadioButton number="1" answer={answer} />
        <FormRadioButton number="2" answer={answer} />
        <FormRadioButton number="3" answer={answer} />
        <FormRadioButton number="4" answer={answer} />
        <FormRadioButton number="5" answer={answer} />
      </RadioGroup>
      <FormHelperText>{errorText}</FormHelperText>
    </FormControl>
  </div>
)

export default MultiChoiceQuestion
