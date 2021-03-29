import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateFormField } from '../util/redux/formReducer'
import { clearError } from '../util/redux/errorReducer'
import MultiChoiceQuestion from './MultiChoiceQuestion'
import TextAreaQuestion from './TextAreaQuestion'

const mapTypeToComponent = {
  CHOICE: MultiChoiceQuestion,
  TEXT: TextAreaQuestion,
}

const Question = ({ question }) => {
  const dispatch = useDispatch()
  const answer = useSelector((state) => state.form.data[question.id])
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

  const Component = mapTypeToComponent[question.type]

  return (
    <Component
      question={question.question.fi}
      answer={answer}
      handleChange={handleChange}
      error={error}
      errorText={errorText()}
    />
  )
}

export default Question
