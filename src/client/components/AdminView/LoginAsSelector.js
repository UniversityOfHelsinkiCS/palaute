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
} from '@material-ui/core'
import { debounce } from 'lodash'
import { format } from 'date-fns'
import { useQuery } from 'react-query'

import apiClient from '../../util/apiClient'

const useUserDetails = (userId, options = {}) => {
  const queryKey = ['user', userId]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/admin/users/${userId}`)

    return data
  }

  const { data: user, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { user, ...rest }
}

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
                ? format(Date.parse(user.lastLoggedIn), 'dd/MM/yyyy hh.mm')
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
              {userDetails.iamGroups.map(({ iam, isRelevant }) => (
                <Box
                  key={iam}
                  color={isRelevant ? 'blue' : 'gray'}
                  fontWeight={isRelevant ? 'fontWeightBold' : 'fontWeightLight'}
                  fontFamily="monospace"
                  fontSize={14}
                >
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
                <Tooltip title={org.name.fi}>
                  <Box key={org.id} fontFamily="monospace" fontSize={14}>
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
  }, 400)

  const handleLoginAs = (user) => () => {
    const { id, employeeNumber } = user

    localStorage.setItem('adminLoggedInAs', id)
    localStorage.setItem('employeenumber', employeeNumber ?? null)
    window.location.reload()
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
            </Box>
          </AccordionSummary>
          <AccordionDetails style={{ backgroundColor: 'Background' }}>
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
