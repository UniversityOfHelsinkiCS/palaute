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
} from '@material-ui/core'
import { debounce } from 'lodash'
import { format } from 'date-fns'

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
          <TableCell>
            {user.lastLoggedIn
              ? format(Date.parse(user.lastLoggedIn), 'dd/MM/YYYY hh.mm')
              : 'Not since 10.6.22'}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Box my={3} />
    <Box m={2}>
      <Typography variant="button">IAM-groups</Typography>
      <Box
        display="flex"
        flexDirection="column"
        alignContent="flex-start"
        flexWrap="wrap"
        maxHeight="200px"
        mt={1}
        style={{ columnGap: '20px' }}
      >
        {user.iamGroups.map(({ iam, isRelevant }) => (
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
      </Box>
    </Box>
  </TableContainer>
)

const LoginAsSelector = () => {
  const [potentialUsers, setPotentialUsers] = useState([])
  const [lastQuery, setLastQuery] = useState({})

  const transformUsers = (users) =>
    users.map((u) => ({
      ...u,
      probablyStaff:
        u.iamGroups.some((iam) => iam.iam === 'hy-employees') &&
        u.employeeNumber,
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
        <Accordion key={user.id}>
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
              <Button onClick={() => handleLoginAs(user)} variant="outlined">
                Login as
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails style={{ backgroundColor: 'Background' }}>
            <Details user={user} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default LoginAsSelector
