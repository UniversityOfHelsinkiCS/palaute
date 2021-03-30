import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { useHistory } from 'react-router'

import { Container } from '@material-ui/core'

import CourseListItem from './CourseListItem'

// import { modifyForm } from '../util/redux/formReducer'
import { getCoursesAction } from '../util/redux/courseReducer'

export default () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.courses)
  // const history = useHistory()
  useEffect(() => {
    // dispatch(getPreviousFeedback())
    dispatch(getCoursesAction())
  }, [])

  /* const handleModify = () => {
    dispatch(modifyForm())
    history.push('/edit')
  }

  const handleList = () => {
    history.push('/list')
  }

  if (state.pending) return null

  if (state.found)
    return (
      <Container maxWidth="md">
        <h4>Olet jo vastannut</h4>
        <Button variant="contained" color="primary" onClick={handleModify}>
          Muokkaa vastausta
        </Button>{' '}
        <Button variant="contained" color="primary" onClick={handleList}>
          Katso palautteen yhteenveto
        </Button>
      </Container>
    ) */

  if (state.pending) return null

  return (
    <Container>
      {state.data.map((course) => (
        <CourseListItem key={course.id} course={course} />
      ))}
    </Container>
  )
}
