import React, { useEffect } from 'react'
import { Button } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import {
  reSubmitFormAction,
  submitFormAction,
  getUserCourseFeedbackAction,
} from '../util/redux/formReducer'
import { setError } from '../util/redux/errorReducer'

import { getLanguageValue } from '../util/languageUtils'

import Question from './QuestionBase'

import { useCourseData, useCourseQuestions } from '../util/queries'

const Form = () => {
  const dispatch = useDispatch()
  const courseId = useParams().id
  const history = useHistory()
  const form = useSelector((state) => state.form)
  const courseData = useCourseData(courseId)
  const questions = useCourseQuestions(courseId)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    dispatch(getUserCourseFeedbackAction(courseId))
  }, [])

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
        dispatch(reSubmitFormAction(answers, form.feedbackId))
      } else {
        dispatch(submitFormAction(answers, courseId))
      }
      history.push(`/view/${courseId}`)
    }
  }

  if (courseData.isLoading || form.pending || questions.isLoading) return null

  const currentCourse = courseData.data

  return (
    <form onSubmit={handleSubmit}>
      <h1>{getLanguageValue(currentCourse.name, i18n.language)}</h1>
      {questions.data &&
        questions.data.data.questions.map((question) => (
          <Question question={question} key={question.id} />
        ))}
      <Button type="submit" variant="contained" color="primary">
        {t('feedbackForm:submitButton')}
      </Button>
    </form>
  )
}

export default Form
