import React from 'react'

import { useTeacherCourses } from '../util/queries'

import TeacherCourseListItem from './TeacherCourseListItem'

const TeacherView = () => {
  const courses = useTeacherCourses()

  if (!courses.data) return null

  courses.data.sort((a, b) =>
    a.validityPeriod.endDate < b.validityPeriod.endDate ? 1 : -1,
  )

  return (
    <>
      {courses.data &&
        courses.data.map((course) => (
          <TeacherCourseListItem key={course.id} course={course} />
        ))}
    </>
  )
}

export default TeacherView
