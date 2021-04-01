import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import { useQuery } from 'react-query'

import { Container } from '@material-ui/core'

import Feedback from './FeedbackBase'

import { getCourseFeedbackAction } from '../util/redux/feedbackReducer'

import questions from '../questions.json'
import { getCoursesAction } from '../util/redux/courseReducer'

import { getAxios } from '../util/apiConnection'

const queryFn = async () => {
  const { data } = await getAxios.get(`/course-unit-realisations/feedback-enabled`)

  return data
}

const useFeedbackEnabledCourses = () => {
  const queryKey = 'feedbackEnabledCourses'

  const ret = useQuery(queryKey, queryFn)

  return ret
}

const FeedbackList = () => {
  const dispatch = useDispatch()
  const feedbacks = useSelector((state) => state.feedback.data)
  const courseId = useParams().id
  const courseData = useSelector((state) => state.courses)
  const test = useFeedbackEnabledCourses()

  useEffect(() => {
    dispatch(getCoursesAction())
  }, [])

  useEffect(() => {
    dispatch(getCourseFeedbackAction(courseId))
  }, [feedbacks.length])

  if (courseData.pending || !feedbacks || test.isLoading) return null
  console.log(test)
  const currentCourse = courseData.data.find((course) => course.id === courseId)

  return (
    <Container>
      <h1>{currentCourse.name.fi}</h1>
      <h2>Annetut palautteet:</h2>
      {questions.questions.map((question) => (
        <Feedback
          question={question}
          answers={feedbacks.map((feedback) => feedback.data[question.id])}
          key={question.id}
        />
      ))}
    </Container>
  )
}

export default FeedbackList
