import React, { useEffect, useState } from 'react'
import { Button } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router'
import { useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'

import { setError } from '../util/redux/errorReducer'

import { getLanguageValue } from '../util/languageUtils'

import Question from './QuestionBase'

import { useFeedbackTarget } from '../hooks/useFeedbackTargetsForStudent'
import apiClient from '../util/apiClient'

const Form = () => {
  const dispatch = useDispatch()
  const targetId = useParams().id
  const history = useHistory()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ found: false, data: {} })

  // TODO: fix
  const feedbackTargetData = useFeedbackTarget(targetId)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (!feedbackTargetData.isLoading) {
      if (feedbackTargetData.feedbackTarget.feedback) {
        setForm({
          found: true,
          data: feedbackTargetData.feedbackTarget.feedback.data,
        })
      }
    }
  }, [feedbackTargetData.isLoading])

  if (feedbackTargetData.isLoading) return null

  const { feedbackTarget } = feedbackTargetData

  const { questions } = feedbackTarget.questions

  const handleSubmit = (event) => {
    event.preventDefault()
    const answers = form.data
    let complete = true
    questions.forEach((question) => {
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
      queryClient.removeQueries('feedbackTargetsForStudent')
      queryClient.removeQueries('feedbackTarget')
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

  return (
    <form onSubmit={handleSubmit}>
      <h1>{getLanguageValue(feedbackTarget.name, i18n.language)}</h1>
      {questions &&
        questions.map((question) => (
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
