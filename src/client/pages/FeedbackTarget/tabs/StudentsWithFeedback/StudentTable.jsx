import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { writeFileXLSX, writeFile, utils } from 'xlsx'
import { parseISO, format } from 'date-fns'
import { CSVLink, CSVDownload } from 'react-csv'

import { Table, TableRow, TableCell, TableBody, TableHead, TableSortLabel, Button, Box } from '@mui/material'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'
import { orderBy } from 'lodash-es'

import { sortTable } from '../../../../util/tableUtils'
import DropZone from './DropZone'
import CardSection from '../../../../components/common/CardSection'

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

const getCourseRealisationLang = courseRealisation => {
  let courseRealisationLang
  // check if courseRealisation.teachingLanguage is set
  if (courseRealisation.teachingLanguages) {
    if (courseRealisation.teachingLanguages.length > 0) {
      if (courseRealisation.teachingLanguages.includes('fi')) {
        courseRealisationLang = 'fi'
      } else if (courseRealisation.teachingLanguages.includes('en')) {
        courseRealisationLang = 'en'
      } else if (courseRealisation.teachingLanguages.includes('sv')) {
        courseRealisationLang = 'sv'
      }
    }
  }

  if (!courseRealisationLang) {
    courseRealisationLang = 'fi'
  }

  return courseRealisationLang
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
    <Button
      sx={styles.button}
      variant="contained"
      color="primary"
      disabled={!students.length}
      onClick={() => writeFileXLSX(workbook, `${fileName}.xlsx`)}
    >
      {t('common:exportXLSX')}
    </Button>
  )
}

const ExportSisuAttainmentCSV = ({ students, fileName }) => {
  const { t } = useTranslation()

  const headers = [
    'firstName',
    'lastName',
    'studentNumber',
    'grade',
    'credits',
    'assessmentDate',
    'completionLanguage',
    'comment',
  ]

  const a = 'jep'
  //add quotes to the a
  const b = `"${a}"`

  const updatedRows = []
  for (const student of students) {
    if (student.feedbackIsGiven) {
      const newRow = [
        student.firstName,
        student.lastName,
        student.studentNumber,
        'hyväksytty',
        '0',
        student.courseRealisationEndDate,
        student.courseRealisationLang,
        '',
      ]
      updatedRows.push(newRow)
    }
  }

  const data = [headers, ...updatedRows]

  return (
    <CSVLink data={data} filename={`${fileName}.csv`}>
      <Button sx={styles.button} variant="contained">
        {t('common:exportSisuAttainmentCSV')}
      </Button>
    </CSVLink>
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

  const courseRealisationLang = getCourseRealisationLang(feedbackTarget.courseRealisation)

  const courseRealisationEndDate = format(parseISO(feedbackTarget.courseRealisation.endDate), 'dd.MM.yyyy')

  const sisuData = useMemo(
    () =>
      orderBy(students, 'lastName').map(({ firstName, lastName, studentNumber, email, feedbackGiven }) => ({
        firstName,
        lastName,
        studentNumber,
        email,
        feedbackGiven: getFeedbackText(feedbackStatusAvailable, feedbackGiven, t),
        feedbackIsGiven: feedbackGiven,
        courseRealisationEndDate,
        courseRealisationLang,
      })),
    [students]
  )

  const sisufileName = `${feedbackTarget.courseUnit.courseCode}_sisu`

  return (
    <CardSection
      title={
        <Box sx={styles.box}>
          {t('feedbackTargetView:studentsWithFeedbackTab')}
          <Box mr="auto" />
          <ExportXLSX students={studentsData} fileName={fileName} showFeedback={feedbackStatusAvailable} />
          <ExportSisuAttainmentCSV students={sisuData} fileName={sisufileName} showFeedback={feedbackStatusAvailable} />
          {feedbackStatusAvailable && (
            <Button
              endIcon={dropZoneVisible ? <ArrowDropUp /> : <ArrowDropDown />}
              variant="contained"
              color="primary"
              sx={styles.button}
              onClick={() => setDropZoneVisible(!dropZoneVisible)}
            >
              {t('common:combineCSV')}
            </Button>
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
