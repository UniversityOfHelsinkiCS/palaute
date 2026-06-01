import React, { useState } from 'react'

import { TextField, Box } from '@mui/material'

import { debounce } from 'lodash-es'

import apiClient from '../../../../util/apiClient'
import UserAccordion from '../../UserAccordion/UserAccordion'
import { handleLoginAs } from '../../utils'

type AdminUser = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  secondaryEmail: string | null
  username: string
  studentNumber: string | null
  degreeStudyRight: boolean | null
  language: string | null
  lastLoggedIn: string | null
}

type AdminUsersResponse = {
  params: Record<string, string>
  persons: AdminUser[]
}

const LoginAsSelector = () => {
  const [potentialUsers, setPotentialUsers] = useState<AdminUser[]>([])
  const [focusIndex, setFocusIndex] = useState(0)
  const [lastQuery, setLastQuery] = useState<Record<string, string>>({})

  const handleChange = debounce(async ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      user: query,
    }

    const { data } = await apiClient.get<AdminUsersResponse>('/admin/users', { params })
    const { params: queried, persons } = data

    setLastQuery(queried)
    setPotentialUsers(persons)
    setFocusIndex(Math.min(focusIndex, persons.length > 0 ? persons.length - 1 : 0))
  }, 400)

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && potentialUsers.length > 0) handleLoginAs(potentialUsers[focusIndex])()
    if (event.key === 'ArrowDown') {
      setFocusIndex(Math.min(focusIndex + 1, potentialUsers.length - 1))
      event.preventDefault()
    }
    if (event.key === 'ArrowUp') {
      setFocusIndex(Math.max(focusIndex - 1, 0))
      event.preventDefault()
    }
  }

  return (
    <Box my={4} onKeyDown={handleKeyPress}>
      <TextField
        style={{ width: '100%' }}
        label="Email, Username, sisu id or student number"
        variant="outlined"
        onChange={handleChange}
        autoFocus
      />

      <div style={{ paddingTop: 10 }}>
        Searched for:{' '}
        {Object.entries(lastQuery).map(([key, value], index) => (
          <p key={index}>
            {key}: {value}
          </p>
        ))}
      </div>

      {potentialUsers.map((user, index) => (
        <UserAccordion
          key={user.id}
          user={user}
          handleLoginAs={handleLoginAs}
          isFocused={index === focusIndex}
          decoration={undefined}
        />
      ))}
    </Box>
  )
}

export default LoginAsSelector
