import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPreviousFeedback } from '../util/redux/formReducer'

import Form from './Form'

export default () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.form)

  useEffect(() => {
    dispatch(getPreviousFeedback())
  }, [state.found])

  if (state.pending) return null

  if (state.found) return <p>Olet jo vastannut</p>

  return (
    <div style={{ paddingTop: '1em' }}>
      <Form />
    </div>
  )
}
