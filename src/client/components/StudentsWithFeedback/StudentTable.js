import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CSVLink } from 'react-csv'
import Papa from 'papaparse'

import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
  TableSortLabel,
  makeStyles,
  Paper,
  Button,
  Box,
} from '@mui/material'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'

import { sortTable } from '../../util/tableUtils'
import DropZone from './DropZone'

const useStyles = makeStyles(() => ({
  box: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  button: {
    margin: 10,
    width: '170px',
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
}))

const StudentTable = ({ students }) => {
  const [dropZoneVisible, setDropZoneVisible] = useState(false)
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('firstName')
  const { t } = useTranslation()

  const classes = useStyles()

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const studentsCSV = students.map(
    ({ firstName, lastName, studentNumber, email, feedbackGiven }) => ({
      firstName,
      lastName,
      studentNumber,
      email,
      feedbackGiven: feedbackGiven ? t('feedbackGiven') : t('feedbackNotGiven'),
    }),
  )

  const ExportCsv = ({ students }) => {
    const headers = [
      t('firstName'),
      t('lastName'),
      t('studentNumber'),
      t('email'),
      t('feedback'),
    ]
    const stats = students.map((student) => [...Object.values(student)])
    const data = [headers, ...stats]

    const parsedData = Papa.unparse(data, { delimiter: ';' })

    return (
      <CSVLink
        className={classes.link}
        data={parsedData}
        filename="students.csv"
      >
        {t('exportCSV')}
      </CSVLink>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Box className={classes.box}>
        <Button
          endIcon={dropZoneVisible ? <ArrowDropUp /> : <ArrowDropDown />}
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => setDropZoneVisible(!dropZoneVisible)}
        >
          {t('combineCSV')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!studentsCSV.length}
          className={classes.button}
        >
          {studentsCSV.length ? (
            <ExportCsv students={studentsCSV} />
          ) : (
            t('exportCSV')
          )}
        </Button>
      </Box>
      {dropZoneVisible && <DropZone students={studentsCSV} />}
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
            <TableHeadCell
              id="email"
              name={t('email')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="feedbackGiven"
              name={t('feedback')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortTable(students, order, orderBy).map(
            ({
              id,
              firstName,
              lastName,
              studentNumber,
              email,
              feedbackGiven,
            }) => (
              <TableRow key={id}>
                <TableCell>{firstName}</TableCell>
                <TableCell>{lastName}</TableCell>
                <TableCell>{studentNumber}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>
                  {String(
                    feedbackGiven ? t('feedbackGiven') : t('feedbackNotGiven'),
                  )}
                </TableCell>
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
