import React, { useState } from 'react'

import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@material-ui/core'
import { debounce } from 'lodash'

import apiClient from '../../util/apiClient'

const LoginAsSelector = () => {
  const [potentialUsers, setPotentialUsers] = useState([])
  const [lastQuery, setLastQuery] = useState({})

  const handleChange = debounce(async ({ target }) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      user: query,
    }

    const { data } = await apiClient.get('/admin/users', { params })
    const { params: queried, persons } = data

    setLastQuery(queried)
    setPotentialUsers(persons)
  }, 400)

  const handleLoginAs = (user) => async () => {
    // eslint-disable-next-line
    if (!confirm(`This will log you in as ${user.firstNames} (${user.id}) and refresh the page.`)) return

    const { id } = user

    localStorage.setItem('adminLoggedInAs', id)
    window.location.reload()
  }

  return (
    <>
      <TextField
        style={{ width: '30em' }}
        label="Username, sisu id or studentnumber"
        variant="outlined"
        onChange={handleChange}
      />
      <div style={{ paddingTop: 10 }}>
        Searched for:{' '}
        {Object.entries(lastQuery).map(([key, value], index) => (
          <p key={index}>
            {key}: {value}
          </p>
        ))}
      </div>
      {potentialUsers.map((user) => (
        <Card key={user.id}>
          <CardContent>
            <b>
              {user.id} - {user.firstNames} {user.lastName} -{' '}
              {user.studentNumber}
            </b>
          </CardContent>
          <CardActions>
            <Button onClick={handleLoginAs(user)} variant="outlined">
              Log in as
            </Button>
          </CardActions>
        </Card>
      ))}
    </>
  )
}

export default LoginAsSelector
