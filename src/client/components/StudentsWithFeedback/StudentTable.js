import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
} from '@material-ui/core'

const StudentTable = ({ students }) => {
  const { t } = useTranslation()

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('firstName')}</TableCell>
            <TableCell>{t('lastName')}</TableCell>
            <TableCell>{t('username')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(({ id, firstName, lastName, username }) => (
            <TableRow key={id}>
              <TableCell>{firstName}</TableCell>
              <TableCell>{lastName}</TableCell>
              <TableCell>{username}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default StudentTable
