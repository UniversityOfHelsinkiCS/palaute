import React, { useState } from 'react'

import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
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
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        `This will log you in as ${user.firstNames} (${user.id}) and refresh the page.`,
      )
    )
      return

    const { id, employeeNumber } = user

    localStorage.setItem('adminLoggedInAs', id)
    localStorage.setItem('employeenumber', employeeNumber ?? null)
    window.location.reload()
  }

  return (
    <Box my={4}>
      <TextField
        style={{ width: '30em' }}
        label="Email, Username, sisu id or studentnumber"
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
              {user.id} - {user.firstNames} {user.lastName} - {user.email} -{' '}
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
    </Box>
  )
}

export default LoginAsSelector
