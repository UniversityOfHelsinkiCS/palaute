import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { writeFileXLSX, utils } from 'xlsx'
import { parseISO, format } from 'date-fns'

import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
  TableSortLabel,
  Paper,
  Button,
  Box,
} from '@mui/material'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'

import { sortTable } from '../../util/tableUtils'
import DropZone from './DropZone'

const styles = {
  box: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  button: {
    margin: 2,
    width: '170px',
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
}

const ExportCsv = ({ students, fileName }) => {
  const { t } = useTranslation()

  const headers = [
    t('firstName'),
    t('lastName'),
    t('studentNumber'),
    t('email'),
    t('feedback'),
  ]
  const stats = students.map((student) => [...Object.values(student)])
  const data = [headers, ...stats]

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, fileName)

  return (
    <Button
      sx={styles.button}
      variant="contained"
      color="primary"
      disabled={!students.length}
      onClick={() => writeFileXLSX(workbook, `${fileName}.xlsx`)}
    >
      {t('exportCSV')}
    </Button>
  )
}

const StudentTable = ({ students, feedbackTarget }) => {
  const [dropZoneVisible, setDropZoneVisible] = useState(false)
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('firstName')
  const { t } = useTranslation()

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

  const fileName = `${feedbackTarget.courseUnit.courseCode}_${format(
    parseISO(feedbackTarget.courseRealisation.startDate),
    'yyyy-MM-dd',
  )}_students`

  return (
    <TableContainer component={Paper}>
      <Box sx={styles.box}>
        <Button
          endIcon={dropZoneVisible ? <ArrowDropUp /> : <ArrowDropDown />}
          variant="contained"
          color="primary"
          sx={styles.button}
          onClick={() => setDropZoneVisible(!dropZoneVisible)}
        >
          {t('combineCSV')}
        </Button>
        <ExportCsv students={studentsCSV} fileName={fileName} />
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
