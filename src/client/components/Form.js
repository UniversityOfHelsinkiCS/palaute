import React, { useEffect, useState } from 'react'
import { Button } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { setError } from '../util/redux/errorReducer'

import { getLanguageValue } from '../util/languageUtils'

import Question from './QuestionBase'

import { useCourseData, useCourseQuestions } from '../util/queries'
import apiClient from '../util/apiClient'

const Form = () => {
  const dispatch = useDispatch()
  const targetId = useParams().id
  const history = useHistory()
  const [form, setForm] = useState({ found: false, data: {} })
  const courseData = useCourseData(targetId)
  const questions = useCourseQuestions(targetId)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (!courseData.isLoading) {
      if (courseData.data.feedback) {
        setForm({
          found: true,
          data: courseData.data.feedback.data,
        })
      }
    }
  }, [courseData.isLoading])

  const handleSubmit = (event) => {
    event.preventDefault()
    const answers = form.data
    let complete = true
    questions.data.data.questions.forEach((question) => {
      if (
        !question.required ||
        (answers[question.id] !== undefined && answers[question.id] !== '')
      )
        return
      dispatch(setError(question.id))
      complete = false
    })
    if (complete) {
      if (form.found) {
        apiClient.put(`/feedbacks/${targetId}`, answers)
      } else {
        apiClient.post('/feedbacks', { answers, targetId })
      }
      history.push(`/`)
    }
  }

  const getQuestionAnswer = (questionId) => form.data[questionId]

  const updateFormField = (questionId, newValue) => {
    setForm({
      ...form.data,
      data: {
        ...form.data,
        [questionId]: newValue,
      },
    })
  }

  if (courseData.isLoading || form.pending || questions.isLoading) return null

  const currentCourse = courseData.data.feedbackTarget

  return (
    <form onSubmit={handleSubmit}>
      <h1>{getLanguageValue(currentCourse.name, i18n.language)}</h1>
      {questions.data &&
        questions.data.data.questions.map((question) => (
          <Question
            question={question}
            key={question.id}
            answer={getQuestionAnswer(question.id)}
            handleFormUpdate={updateFormField}
          />
        ))}
      <Button type="submit" variant="contained" color="primary">
        {t('feedbackForm:submitButton')}
      </Button>
    </form>
  )
}

export default Form
