import React, { useState } from 'react'

import {
  TextField,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  Typography,
  Chip,
  AccordionActions,
  Tooltip,
} from '@mui/material'
import { KeyboardReturn } from '@mui/icons-material'

import { debounce } from 'lodash'
import { format } from 'date-fns'

import apiClient from '../../util/apiClient'
import useUserDetails from '../../hooks/useUserDetails'

const Details = ({ user }) => {
  const { user: userDetails, isLoading } = useUserDetails(user.id)

  return (
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
            <TableCell>
              {user.lastLoggedIn
                ? format(Date.parse(user.lastLoggedIn), 'dd/MM/yyyy HH.mm')
                : 'Not since 10.6.22'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Box my={3} />
      <Box m={2}>
        {!isLoading && (
          <>
            <Typography variant="button">IAM-groups</Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignContent="flex-start"
              flexWrap="wrap"
              maxHeight="200px"
              mt={1}
              mb={4}
              style={{ columnGap: '20px' }}
            >
              {userDetails.iamGroups.map((iam) => (
                <Box key={iam} fontFamily="monospace" fontSize={14}>
                  {iam}
                </Box>
              ))}
              {!userDetails.iamGroups?.length > 0 && (
                <Box fontFamily="monospace" fontSize={14}>
                  none
                </Box>
              )}
            </Box>
            <Typography variant="button">Organisation access</Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignContent="flex-start"
              flexWrap="wrap"
              maxHeight="200px"
              mt={1}
              mb={2}
              style={{ columnGap: '20px' }}
            >
              {userDetails.access.map(({ organisation: org, access }) => (
                <Tooltip key={org.id} title={org.name.fi}>
                  <Box fontFamily="monospace" fontSize={14}>
                    {org.code} {access.read ? 'r' : '-'}
                    {access.write ? 'w' : '-'}
                    {access.admin ? 'a' : '-'}
                  </Box>
                </Tooltip>
              ))}
              {!userDetails.access?.length > 0 && (
                <Box fontFamily="monospace" fontSize={14}>
                  none
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </TableContainer>
  )
}

const LoginAsSelector = () => {
  const [potentialUsers, setPotentialUsers] = useState([])
  const [focusIndex, setFocusIndex] = useState(0)
  const [lastQuery, setLastQuery] = useState({})

  const transformUsers = (users) =>
    users.map((u) => ({
      ...u,
      probablyStaff: u.hasEmployeeIam && u.employeeNumber,
      possiblyStaff: Boolean(u.employeeNumber),
    }))

  const handleChange = debounce(async ({ target }) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      user: query,
    }

    const { data } = await apiClient.get('/admin/users', { params })
    const { params: queried, persons } = data

    setLastQuery(queried)
    setPotentialUsers(transformUsers(persons))
    setFocusIndex(
      Math.min(focusIndex, persons.length > 0 ? persons.length - 1 : 0),
    )
  }, 400)

  const handleLoginAs = (user) => () => {
    const { id, employeeNumber } = user

    localStorage.setItem('adminLoggedInAs', id)
    localStorage.setItem('employeenumber', employeeNumber ?? null)
    window.location.reload()
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && potentialUsers.length > 0)
      handleLoginAs(potentialUsers[focusIndex])()
    if (event.key === 'ArrowDown') {
      setFocusIndex(Math.min(focusIndex + 1, potentialUsers.length - 1))
      event.preventDefault()
    }
    if (event.key === 'ArrowUp') {
      setFocusIndex(Math.max(focusIndex - 1, 0))
      event.preventDefault()
    }
  }

  const getChip = (user) => (
    <>
      {user.possiblyStaff && !user.probablyStaff && (
        <Chip label="Possibly staff" variant="outlined" />
      )}
      {user.probablyStaff && (
        <Chip label="Definitely staff" color="primary" variant="outlined" />
      )}
    </>
  )

  return (
    <Box my={4} onKeyDown={handleKeyPress}>
      <TextField
        style={{ width: '30em' }}
        label="Email, Username, sisu id or student number"
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
      {potentialUsers.map((user, index) => (
        <Accordion
          key={user.id}
          TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
        >
          <AccordionSummary style={{ cursor: 'default' }}>
            <Box display="flex" alignItems="center" width="100%">
              <Typography>
                {user.firstName} {user.lastName}
              </Typography>
              <Box mr={2} />
              <Typography>{user.email ?? user.secondaryEmail}</Typography>
              <Box mr={4} />
              {getChip(user)}
              <Box mr="auto" />
              {index === focusIndex && (
                <Box display="flex" alignItems="center" justifySelf="end">
                  <Typography variant="body2" color="textSecondary">
                    Login as
                  </Typography>
                  <Box mr={1} />
                  <KeyboardReturn />
                </Box>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails style={{ backgroundColor: '#fff6de' }}>
            <Details user={user} />
          </AccordionDetails>
          <AccordionActions>
            <Button
              onClick={handleLoginAs(user)}
              variant="outlined"
              color="primary"
            >
              Login as
            </Button>
          </AccordionActions>
        </Accordion>
      ))}
    </Box>
  )
}

export default LoginAsSelector
