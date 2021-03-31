import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Container } from '@material-ui/core'

import CourseListItem from './CourseListItem'

import { getCoursesAction } from '../util/redux/courseReducer'

export default () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.courses)

  useEffect(() => {
    dispatch(getCoursesAction())
  }, [])

  if (state.pending) return null

  return (
    <Container>
      {state.data.map((course) => (
        <CourseListItem key={course.id} course={course} />
      ))}
    </Container>
  )
}
