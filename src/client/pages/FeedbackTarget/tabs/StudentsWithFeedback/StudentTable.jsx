import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { writeFileXLSX, utils } from 'xlsx'
import { parseISO, format } from 'date-fns'

import { Table, TableRow, TableCell, TableBody, TableHead, TableSortLabel, Box } from '@mui/material'
import { Download, ArrowDropUp, ArrowDropDown } from '@mui/icons-material'
import { orderBy } from 'lodash-es'

import { sortTable } from '../../../../util/tableUtils'
import DropZone from './DropZone'
import CardSection from '../../../../components/common/CardSection'
import { NorButton } from '../../../../components/common/NorButton'

const styles = {
  box: {
    display: 'flex',
  },
  button: {
    ml: '1rem',
    width: '170px',
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
}

const getFeedbackText = (feedbackStatusAvailable, feedbackGiven, t) => {
  if (!feedbackStatusAvailable) return t('common:feedbackHidden')

  return feedbackGiven ? t('common:feedbackGiven') : t('common:feedbackNotGiven')
}

const ExportXLSX = ({ students, fileName }) => {
  const { t } = useTranslation()

  const headers = [
    t('common:firstName'),
    t('common:lastName'),
    t('common:studentNumber'),
    t('common:email'),
    t('common:feedback'),
  ]
  const stats = students.map(student => [...Object.values(student)])
  const data = [headers, ...stats]

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, fileName)

  return (
    <NorButton
      sx={styles.button}
      color="primary"
      disabled={!students.length}
      onClick={() => writeFileXLSX(workbook, `${fileName}.xlsx`)}
      icon={<Download />}
    >
      {t('common:exportXLSX')}
    </NorButton>
  )
}

const StudentTable = ({ students, feedbackTarget }) => {
  const [dropZoneVisible, setDropZoneVisible] = useState(false)
  const [order, setOrder] = useState('desc')
  const [orderByKey, setOrderByKey] = useState('lastName')
  const { t } = useTranslation()

  const handleRequestSort = (e, property) => {
    const isAsc = orderByKey === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderByKey(property)
  }

  const feedbackStatusAvailable = students.some(student => 'feedbackGiven' in student)

  const studentsData = useMemo(
    () =>
      orderBy(students, 'lastName').map(({ firstName, lastName, studentNumber, email, feedbackGiven }) => ({
        firstName,
        lastName,
        studentNumber,
        email,
        feedbackGiven: getFeedbackText(feedbackStatusAvailable, feedbackGiven, t),
      })),
    [students]
  )

  const fileName = `${feedbackTarget.courseUnit.courseCode}_${format(
    parseISO(feedbackTarget.courseRealisation.startDate),
    'yyyyMMdd'
  )}student`

  return (
    <CardSection
      title={
        <Box sx={styles.box}>
          {t('feedbackTargetView:studentsWithFeedbackTab')}
          <Box mr="auto" />
          <ExportXLSX students={studentsData} fileName={fileName} showFeedback={feedbackStatusAvailable} />
          {feedbackStatusAvailable && (
            <NorButton
              icon={dropZoneVisible ? <ArrowDropUp /> : <ArrowDropDown />}
              color="secondary"
              sx={styles.button}
              onClick={() => setDropZoneVisible(!dropZoneVisible)}
            >
              {t('common:combineCSV')}
            </NorButton>
          )}
        </Box>
      }
    >
      {dropZoneVisible && <DropZone students={studentsData} />}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell
              id="firstName"
              name={t('common:firstName')}
              order={order}
              orderBy={orderByKey}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="lastName"
              name={t('common:lastName')}
              order={order}
              orderBy={orderByKey}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="studentNumber"
              name={t('common:studentNumber')}
              order={order}
              orderBy={orderByKey}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="email"
              name={t('common:email')}
              order={order}
              orderBy={orderByKey}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="feedbackGiven"
              name={t('common:feedback')}
              order={order}
              orderBy={orderByKey}
              onRequestSort={handleRequestSort}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortTable(students, order, orderByKey).map(
            ({ id, firstName, lastName, studentNumber, email, feedbackGiven }) => (
              <TableRow key={id}>
                <TableCell>{firstName}</TableCell>
                <TableCell>{lastName}</TableCell>
                <TableCell>{studentNumber}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{getFeedbackText(feedbackStatusAvailable, feedbackGiven, t)}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </CardSection>
  )
}

const TableHeadCell = ({ id, name, order, orderBy, onRequestSort }) => {
  const createSortHandler = property => e => {
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
