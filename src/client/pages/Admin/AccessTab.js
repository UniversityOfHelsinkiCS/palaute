import React, { useState, useEffect } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

import { getFaculties, getProgrammeAccessByFaculty } from './utils'
import getAllUserAccess from '../../hooks/useAllUserAccess'
import useOrganisationData from '../../hooks/useOrganisationData'
import useHistoryState from '../../hooks/useHistoryState'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { ADMINS } from '../../../config'

const AccessTable = ({ access, filterAdmins }) => {
  const sortByAccess = ({ access: a }, { access: b }) => {
    const SORT_VALUES = {
      read: 1,
      write: 2,
      admin: 3,
    }

    a = Object.keys(a[0].access).filter(key => a[0].access[key])
    b = Object.keys(b[0].access).filter(key => b[0].access[key])

    return b.reduce((sum, b) => sum + SORT_VALUES[b], 0) - a.reduce((sum, a) => sum + SORT_VALUES[a], 0)
  }

  if (filterAdmins) access = access.filter(({ username }) => !ADMINS.includes(username))

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Read</TableCell>
            <TableCell>Write</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>Last login</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {access.sort(sortByAccess).map(user => {
            const { id, firstName, lastName, access, lastLoggedIn } = user
            const { read, write, admin } = access[0].access

            return (
              <TableRow key={id}>
                <TableCell>{`${firstName} ${lastName}`}</TableCell>
                <TableCell>{read ? 'true' : 'false'}</TableCell>
                <TableCell>{write ? 'true' : 'false'}</TableCell>
                <TableCell>{admin ? 'true' : 'false'}</TableCell>
                <TableCell>
                  {lastLoggedIn ? format(Date.parse(lastLoggedIn), 'dd/MM/yyyy HH.mm') : 'Not since 10.6.22'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const ProgrammeAccordion = ({ code, name, access, filterAdmins }) => (
  <Accordion key={code} TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}>
    <AccordionSummary sx={{ cursor: 'pointer', '&:hover': { background: grey['50'] } }}>
      <Box display="flex" alignItems="center" width="100%">
        <Typography>{name.fi}</Typography>
        <Box mr={2} />
        <Typography color="textSecondary">{code}</Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <AccessTable access={access} filterAdmins={filterAdmins} />
    </AccordionDetails>
  </Accordion>
)

const AccessTab = () => {
  const [access, setAccess] = useState([])
  const [filterAdmins, setFilterAdmins] = useState(true)
  const [facultyCode, setFaculty] = useHistoryState('organisationAccessFaculty', 'All')

  const { t } = useTranslation()

  const { usersWithAccess, isLoading } = getAllUserAccess()
  const { data, isLoading: dataIsLoading } = useOrganisationData()

  useEffect(() => {
    if (isLoading || dataIsLoading) return

    const programmeAccess = getProgrammeAccessByFaculty(usersWithAccess, facultyCode, data)
    setAccess(programmeAccess)
  }, [facultyCode, isLoading])

  if (isLoading) return <LoadingProgress />

  const faculties = getFaculties(data || [])

  return (
    <Box>
      <Box mt={2} mb={2} display="flex" flexDirection="row">
        <Box width={400} mr={2}>
          <FormControl fullWidth>
            <InputLabel>{t('courseSummary:facultyLabel')}</InputLabel>
            <Select value={facultyCode} onChange={({ target }) => setFaculty(target.value)} label="Tiedekunta">
              <MenuItem value="All">{t('courseSummary:allFaculties')}</MenuItem>
              {faculties.map(faculty => (
                <MenuItem key={faculty.code} value={faculty.code}>
                  {faculty.name.fi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={filterAdmins} onClick={() => setFilterAdmins(!filterAdmins)} />}
          label="Filter Norppa admins"
        />
      </Box>

      {access
        .sort((a, b) => a.name.fi > b.name.fi)
        .map(({ key, name, access }) => (
          <ProgrammeAccordion key={key} code={key} name={name} access={access} filterAdmins={filterAdmins} />
        ))}
    </Box>
  )
}

export default AccessTab
