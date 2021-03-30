import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, Redirect } from 'react-router'

import { Container, Button } from '@material-ui/core'

import { modifyForm } from '../util/redux/formReducer'

export default () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.form)
  const history = useHistory()

  useEffect(() => {
    // dispatch(getPreviousFeedback())
  }, [])

  const handleModify = () => {
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
    )

  return <Redirect to="/edit" />
}
