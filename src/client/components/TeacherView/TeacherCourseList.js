import React, { useState } from 'react'

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
import { sortCourses } from './utils'

const TeacherCourseList = ({ courses }) => {
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  if (!courses) return null

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableHeadCell
              id="name"
              name="Course name"
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableHeadCell
              id="courseCode"
              name="Course code"
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortCourses(courses, order, orderBy).map((course) => (
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
