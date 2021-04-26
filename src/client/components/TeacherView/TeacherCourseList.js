import React from 'react'

import TeacherCourseListItem from './TeacherCourseListItem'
import { sortCourses } from './utils'

const TeacherCourseList = ({ courses, sortedBy }) => {
  const sortedCourses = sortCourses(courses, sortedBy)

  return (
    <>
      {sortedCourses.map((course) => (
        <TeacherCourseListItem key={course.id} course={course} />
      ))}
    </>
  )
}

export default TeacherCourseList
