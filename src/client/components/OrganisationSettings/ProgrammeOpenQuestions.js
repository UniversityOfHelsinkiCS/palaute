import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, CircularProgress, Typography, Divider } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import useProgrammeOpenQuestions from '../../hooks/useProgrammeOpenQuestions'
import { filterCoursesWithNoResponses } from './utils'

const ProgrammeOpenQuestions = () => {
  const { code } = useParams()
  const { i18n } = useTranslation()
  const { language } = i18n

  const { codesWithIds, isLoading } = useProgrammeOpenQuestions(code)

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  const filteredCourses = filterCoursesWithNoResponses(codesWithIds)

  return (
    <div>
      {filteredCourses.map((course) => (
        <Box key={course.code}>
          <Typography
            variant="h6"
            component="h6"
          >{`${course.code} - ${course.name[language]}`}</Typography>
          {course.questions.map(({ question, responses }) => (
            <Box key={question.id}>
              <Typography
                variant="body1"
                component="p"
                style={{ fontWeight: 'bold' }}
              >
                {question.data.label[language]}
              </Typography>
              {responses.map((r, index) => (
                <div key={index}>
                  <Typography
                    variant="body2"
                    component="p"
                    style={{ marginLeft: 5 }}
                  >
                    {r}
                  </Typography>
                  <Divider style={{ margin: 2 }} />
                </div>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </div>
  )
}

export default ProgrammeOpenQuestions
