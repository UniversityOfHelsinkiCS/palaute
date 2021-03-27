import React from 'react'
import { Button, Container } from '@material-ui/core'
import { useDispatch } from 'react-redux'

import MultiChoiceQuestion from './MultiChoiceQuestion'
import TextAreaQuestion from './TextAreaQuestion'

import { submitFormAction } from '../util/redux/formReducer'

import questions from '../questions.json'

const Form = () => {
  const dispatch = useDispatch()
  const handleSubmit = () => {
    dispatch(submitFormAction())
  }

  return (
    <>
      <Container maxWidth="md">
        <h1>{questions.title}</h1>
        {questions.multichoice.map((question) => (
          <MultiChoiceQuestion question={question} key={question.id} />
        ))}
        {questions.textarea.map((question) => (
          <TextAreaQuestion question={question} key={question.id} />
        ))}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Anna palautetta!
        </Button>
      </Container>
    </>
  )
}

export default Form
