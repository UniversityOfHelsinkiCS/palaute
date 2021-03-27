import React from 'react'
import { Radio, RadioGroup, FormControlLabel } from '@material-ui/core'

const MultiChoiceQuestion = ({ question }) => {
  const handleChange = (event) => {
    event.preventDefault()
  }

  return (
    <>
      <h4>{question.question.fi}</h4>
      <RadioGroup row onChange={handleChange}>
        <FormControlLabel
          value="1"
          control={<Radio color="primary" />}
          label="1"
          labelPlacement="top"
        />
        <FormControlLabel
          value="2"
          control={<Radio color="primary" />}
          label="2"
          labelPlacement="top"
        />
        <FormControlLabel
          value="3"
          control={<Radio color="primary" />}
          label="3"
          labelPlacement="top"
        />
        <FormControlLabel
          value="4"
          control={<Radio color="primary" />}
          label="4"
          labelPlacement="top"
        />
        <FormControlLabel
          value="5"
          control={<Radio color="primary" />}
          label="5"
          labelPlacement="top"
        />
      </RadioGroup>
    </>
  )
}

export default MultiChoiceQuestion
