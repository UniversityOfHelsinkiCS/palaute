import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { writeFileXLSX, utils } from 'xlsx'
import { parseISO, format } from 'date-fns'
import { CSVLink } from 'react-csv'

import { Table, TableRow, TableCell, TableBody, TableHead, TableSortLabel, Box } from '@mui/material'
import { Download } from '@mui/icons-material'
import { orderBy } from 'lodash-es'

import { sortTable } from '../../../../util/tableUtils'
import CardSection from '../../../../components/common/CardSection'
import { SHOW_BUTTON_DOWNLOAD_SISU_CSV } from '../../../../util/common'
import { NorButton } from '../../../../components/common/NorButton'
import { getSafeCourseCode } from '../../../../util/courseIdentifiers'
import { focusIndicatorStyle } from '../../../../util/accessibility'

//This defines certain courserealisations at SISU. There is no other way to get this information
//Name tells if courserealisation is used to gather information for SISU about who is given feedback and who is not
const SISU_FEEDBACK_FT_CR_NAME_FI = 'Palaute'

const styles = {
  box: {
    display: 'flex',
  },
  button: {
    ml: '1rem',
    width: '170px',
    ...focusIndicatorStyle(),
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
  const langPriority = ['fi', 'en', 'sv']
  const courseRealisationLang = courseRealisation.teachingLanguages?.find(lang => langPriority.includes(lang)) || 'fi'

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
    <NorButton
      sx={styles.button}
      disableRipple
      color="primary"
      disabled={!students.length}
      onClick={() => writeFileXLSX(workbook, `${fileName}.xlsx`)}
      icon={<Download />}
    >
      {t('common:exportXLSX')}
    </NorButton>
  )
}

const ExportSisuAttainmentCSV = ({ students, fileName }) => {
  const { t } = useTranslation()

  //csv description: https://funidata.atlassian.net/wiki/spaces/OTM/pages/1836661/Arviointi#Arviointi-ArvioinnintuominenCSV%3An%C3%A4

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
      <NorButton sx={styles.button} icon={<Download />} color="primary" disabled={!students.length}>
        {t('common:exportSisuAttainmentCSV')}
      </NorButton>
    </CSVLink>
  )
}

const StudentTable = ({ students, feedbackTarget }) => {
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

  const safeCourseCode = getSafeCourseCode({
    courseCode: feedbackTarget?.courseUnit?.courseCode,
    forUrl: false,
  })

  const fileName = `${safeCourseCode}_${format(
    parseISO(feedbackTarget.courseRealisation.startDate),
    'yyyyMMdd'
  )}student`

  const courseRealisationLang = getCourseRealisationLang(feedbackTarget.courseRealisation)

  const courseRealisationEndDate = format(parseISO(feedbackTarget.courseRealisation.endDate), 'dd.MM.yyyy')

  const courseRealisationNameFi = feedbackTarget.courseRealisation.name.fi

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
          {SHOW_BUTTON_DOWNLOAD_SISU_CSV && courseRealisationNameFi === SISU_FEEDBACK_FT_CR_NAME_FI && (
            <ExportSisuAttainmentCSV
              students={sisuData}
              fileName={sisufileName}
              showFeedback={feedbackStatusAvailable}
            />
          )}
        </Box>
      }
    >
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
        sx={{ p: '2px', ...focusIndicatorStyle() }}
      >
        {name}
      </TableSortLabel>
    </TableCell>
  )
}

export default StudentTable
