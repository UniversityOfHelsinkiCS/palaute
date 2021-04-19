import React from 'react'

import { useTeacherCourses } from '../util/queries'

import TeacherCourseListItem from './TeacherCourseListItem'

const TeacherView = () => {
  const courses = useTeacherCourses()

  if (!courses.data) return null

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
