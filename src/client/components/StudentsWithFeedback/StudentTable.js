import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
  TableSortLabel,
  Paper,
} from '@material-ui/core'

import { sortTable } from '../../util/tableUtils'

const StudentTable = ({ students }) => {
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('firstName')
  const { t } = useTranslation()

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell
              id="firstName"
              name={t('firstName')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="lastName"
              name={t('lastName')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="studentNumber"
              name={t('studentNumber')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortTable(students, order, orderBy).map(
            ({ id, firstName, lastName, studentNumber }) => (
              <TableRow key={id}>
                <TableCell>{firstName}</TableCell>
                <TableCell>{lastName}</TableCell>
                <TableCell>{studentNumber}</TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const TableHeadCell = ({ id, name, order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (e) => {
    onRequestSort(e, property)
  }

  return (
    <TableCell align="left" sortDirection={orderBy === id ? order : false}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : 'asc'}
        onClick={createSortHandler(id)}
      >
        {name}
      </TableSortLabel>
    </TableCell>
  )
}

export default StudentTable
