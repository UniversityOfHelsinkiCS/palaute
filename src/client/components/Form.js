import React from 'react'
import { Button, Container } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import MultiChoiceQuestion from './MultiChoiceQuestion'
import TextAreaQuestion from './TextAreaQuestion'

import { submitFormAction } from '../util/redux/formReducer'

import questions from '../questions.json'

const Form = () => {
  const dispatch = useDispatch()
  const answers = useSelector((state) => state.form)

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(submitFormAction(answers))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Container maxWidth="md">
        <h1>{questions.title}</h1>
        {questions.multichoice.map((question) => (
          <MultiChoiceQuestion question={question} key={question.id} />
        ))}
        {questions.textarea.map((question) => (
          <TextAreaQuestion question={question} key={question.id} />
        ))}
        <Button type="submit" variant="contained" color="primary">
          Anna palautetta!
        </Button>
      </Container>
    </form>
  )
}

export default Form
