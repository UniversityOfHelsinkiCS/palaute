import React, { useState } from 'react'

import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  Typography,
} from '@material-ui/core'
import { debounce } from 'lodash'

import apiClient from '../../util/apiClient'

const Details = ({ user }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>SN</TableCell>
          <TableCell>EN</TableCell>
          <TableCell>username</TableCell>
          <TableCell>secondary email</TableCell>
          <TableCell>degree study right</TableCell>
          <TableCell>language</TableCell>
          <TableCell>Last logged in</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>{user.id}</TableCell>
          <TableCell>{user.studentNumber}</TableCell>
          <TableCell>{user.employeeNumber}</TableCell>
          <TableCell>{user.username}</TableCell>
          <TableCell>{user.secondaryEmail}</TableCell>
          <TableCell>{String(user.degreeStudyRight)}</TableCell>
          <TableCell>{user.language}</TableCell>
          <TableCell>{user.lastLoggedIn ?? 'Not since 10.6.22'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Box my={2} />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>IAM</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {user.iamGroups.map((iam) => (
          <TableRow key={iam}>
            <TableCell>{iam}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

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
  console.log(potentialUsers[0])

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
        <Accordion key={user.id}>
          <AccordionSummary style={{ cursor: 'default' }}>
            <Box display="flex" alignItems="center" width="100%">
              <Typography>
                {user.firstName} {user.lastName}
              </Typography>
              <Box mr={2} />
              <Typography>{user.email ?? user.secondaryEmail}</Typography>
              <Box mr="auto" />
              <Button onClick={() => handleLoginAs(user)} variant="outlined">
                Login as
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails style={{ backgroundColor: 'Background' }}>
            <Details user={user} />
          </AccordionDetails>
          <AccordionActions>
            <Button variant="outlined">This does nothing yet</Button>
          </AccordionActions>
        </Accordion>
      ))}
    </Box>
  )
}

export default LoginAsSelector
