import React, { useMemo } from 'react'
import { Typography, List, Divider, Box } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'

import FeedbackListItem from './FeedbackListItem'
import { useFeedbackEnabledCourses, useUserFeedback } from '../../util/queries'

import apiClient from '../../util/apiClient'

const makeCoursesWithAnswer = (answers) => {
  const coursesWithAnswer = new Set()

  if (answers) {
    answers.forEach((answer) => {
      coursesWithAnswer.add(answer.courseRealisationId)
    })
  }

  return coursesWithAnswer
}

const makeCompareCourses = (coursesWithAnswer) => (a, b) => {
  if (coursesWithAnswer.has(a.id) && coursesWithAnswer.has(b.id)) {
    return a.endDate < b.endDate ? -1 : 1
  }
  if (coursesWithAnswer.has(a.id)) {
    return 1
  }
  if (coursesWithAnswer.has(b.id)) {
    return -1
  }
  return a.endDate < b.endDate ? -1 : 1
}

const UserFeedbacks = () => {
  const { t } = useTranslation()
  const courses = useFeedbackEnabledCourses()
  const answers = useUserFeedback()
  // test, will refactor to another file

  const queryClient = useQueryClient()

  const coursesWithAnswer = useMemo(() => makeCoursesWithAnswer(answers.data), [
    answers.data,
  ])

  const makeDeletePath = (courseId) => {
    if (!coursesWithAnswer.has(courseId)) return null
    const { id } = answers.data.find(
      (answer) => answer.courseRealisationId === courseId,
    )

    return `/feedbacks/${id}`
  }

  const deleteMutation = useMutation('delete', {
    mutationFn: (courseId) => apiClient.delete(makeDeletePath(courseId)),
    onSuccess: (_, courseId) => {
      queryClient.setQueryData('userFeedback', (old) =>
        old.filter((answer) => answer.courseRealisationId !== courseId),
      )
    },
  })

  const onDelete = async (courseId) => {
    await deleteMutation.mutate(courseId)
  }

  const compareCourses = makeCompareCourses(coursesWithAnswer)

  if (courses.isLoading || answers.isLoading) return null

  courses.data.sort(compareCourses)
  return (
    <div>
      <Typography variant="h4">{t('userFeedbacks:mainHeading')}</Typography>
      <List>
        {courses.data.map((course) => (
          <div key={course.id}>
            <Box my={2}>
              <FeedbackListItem
                course={course}
                answered={coursesWithAnswer.has(course.id)}
                onDelete={() => onDelete(course.id)}
              />
            </Box>
            <Divider component="li" />
          </div>
        ))}
      </List>
    </div>
  )
}

export default UserFeedbacks
