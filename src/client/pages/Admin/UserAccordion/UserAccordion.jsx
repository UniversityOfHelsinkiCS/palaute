import { KeyboardReturn } from '@mui/icons-material'
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { format } from 'date-fns'
import React from 'react'
import useUserDetails from '../../../hooks/useUserDetails'
import { NorButton } from '../../../components/common/NorButton'

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
              {user.lastLoggedIn ? format(Date.parse(user.lastLoggedIn), 'dd/MM/yyyy HH.mm') : 'Not since 10.6.22'}
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
              {userDetails.iamGroups.map(iam => (
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

const StaffChip = ({ user }) => user.possiblyStaff && <Chip label="Possibly staff" variant="outlined" />

const UserAccordion = ({ user, isFocused, handleLoginAs, decoration }) => (
  <Accordion
    key={user.id}
    slotProps={{
      transition: {
        mountOnEnter: true,
        unmountOnExit: true,
      },
    }}
  >
    <AccordionSummary sx={{ cursor: 'pointer', '&:hover': { background: grey['50'] } }}>
      <Box display="flex" alignItems="center" width="100%">
        <Typography>
          {user.firstName} {user.lastName}
        </Typography>
        <Box mr={2} />
        <Typography>{user.email ?? user.secondaryEmail}</Typography>
        <Box mr={4} />
        <StaffChip user={user} />
        <Box mr={4} />
        {decoration}
        <Box mr="auto" />
        {isFocused && (
          <Box display="flex" alignItems="center" justifySelf="end">
            <Typography variant="body2" color="textSecondary">
              Press
            </Typography>
            <Box mr="0.3rem" />
            <KeyboardReturn fontSize="small" />
            <Box mr="0.3rem" />
            <Typography variant="body2" color="textSecondary">
              enter to login as
            </Typography>
          </Box>
        )}
      </Box>
    </AccordionSummary>
    <AccordionDetails style={{ backgroundColor: '#fff6de' }}>
      <Details user={user} />
    </AccordionDetails>
    <AccordionActions>
      {typeof handleLoginAs === 'function' && (
        <NorButton onClick={handleLoginAs(user)} color="primary">
          Login as
        </NorButton>
      )}
    </AccordionActions>
  </Accordion>
)

export default UserAccordion
