import React from 'react'
import { Button, Container } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import { submitFormAction } from '../util/redux/formReducer'
import { setError } from '../util/redux/errorReducer'

import questions from '../questions.json'
import Question from './QuestionBase'

const Form = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const answers = useSelector((state) => state.form)

  const handleSubmit = (event) => {
    event.preventDefault()
    let complete = true
    questions.questions.forEach((question) => {
      if (
        !question.required ||
        (answers[question.id] !== undefined && answers[question.id] !== '')
      )
        return
      dispatch(setError(question.id))
      complete = false
    })
    if (complete) {
      dispatch(submitFormAction(answers))
      history.push('/list')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Container maxWidth="md">
        <h1>{questions.title}</h1>
        {questions.questions.map((question) => (
          <Question question={question} key={question.id} />
        ))}
        <Button type="submit" variant="contained" color="primary">
          Anna palautetta!
        </Button>
      </Container>
    </form>
  )
}

export default Form
