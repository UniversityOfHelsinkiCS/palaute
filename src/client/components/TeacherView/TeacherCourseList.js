import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from '@material-ui/core'

import TeacherCourseListItem from './TeacherCourseListItem'
import { sortTable } from '../../util/tableUtils'

const TeacherCourseList = ({ courses }) => {
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('name')

  const { t } = useTranslation()

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  if (!courses) return null

  sortTable(courses, order, orderBy)

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableHeadCell
              id="name"
              name={t('teacherView:courseName')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="courseCode"
              name={t('teacherView:courseCode')}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortTable(courses, order, orderBy).map((course) => (
            <TeacherCourseListItem course={course} key={course.id} />
          ))}
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

export default TeacherCourseList
