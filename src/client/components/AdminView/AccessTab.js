import React, { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tooltip,
} from '@mui/material'
import { grey } from '@mui/material/colors'

import getAllUserAccess from '../../hooks/useAllUserAccess'
import {
  getFaculties,
  getProgrammeAccessByFaculty,
  handleLoginAs,
} from './utils'
import { LoadingProgress } from '../common/LoadingProgress'

import UserAccordion from './UserAccordion'

const ProgrammeAccordion = ({ code, name, access }) => (
  <Accordion
    key={code}
    TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
  >
    <AccordionSummary
      sx={{ cursor: 'pointer', '&:hover': { background: grey['50'] } }}
    >
      <Box display="flex" alignItems="center" width="100%">
        <Typography>{name.fi}</Typography>
        <Box mr={2} />
        <Typography color="textSecondary">{code}</Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      {access.map((user) => (
        <UserAccordion
          key={user.employeeNumber}
          user={user}
          handleLoginAs={handleLoginAs}
          decoration={
            <Box>
              {user.access.map(({ organisation: org, access }) => (
                <Tooltip key={org.id} title={org.name.fi}>
                  <Box fontFamily="monospace" fontSize={14}>
                    {access.read ? 'r' : '-'}
                    {access.write ? 'w' : '-'}
                    {access.admin ? 'a' : '-'}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          }
        />
      ))}
    </AccordionDetails>
  </Accordion>
)

const AccessTab = () => {
  const [facultyCode, setFaculty] = useState('H50')
  const [access, setAccess] = useState([])

  const { usersWithAccess, isLoading } = getAllUserAccess()

  useEffect(() => {
    if (isLoading) return

    const programmeAccess = getProgrammeAccessByFaculty(
      usersWithAccess,
      facultyCode,
    )
    setAccess(programmeAccess)
  }, [facultyCode])

  if (isLoading) return <LoadingProgress />

  const faculties = getFaculties()

  return (
    <Box>
      <Tabs value={facultyCode} onChange={(_, value) => setFaculty(value)}>
        {faculties.map(({ code, name }) => (
          <Tab key={code} value={code} label={name.fi} />
        ))}
      </Tabs>
      {access.map(({ key, name, access }) => (
        <ProgrammeAccordion code={key} name={name} access={access} />
      ))}
    </Box>
  )
}

export default AccessTab
