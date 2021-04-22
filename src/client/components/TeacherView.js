import React from 'react'

import { useTeacherCourses } from '../util/queries'

import TeacherCourseListItem from './TeacherCourseListItem'

const TeacherView = () => {
  const courses = useTeacherCourses()

  if (!courses.data) return null

  courses.data.sort((a, b) =>
    a.validityPeriod.endDate < b.validityPeriod.endDate ? 1 : -1,
  )

  const codes = new Set()

  const uniqueCourses = []

  courses.data.forEach((course) => {
    if (codes.has(course.courseCode)) return
    uniqueCourses.push(course)
    codes.add(course.courseCode)
  })

  uniqueCourses.sort((a, b) => (a.courseCode < b.courseCode ? -1 : 1))

  return (
    <>
      {uniqueCourses.map((course) => (
        <TeacherCourseListItem key={course.id} course={course} />
      ))}
    </>
  )
}

export default TeacherView
