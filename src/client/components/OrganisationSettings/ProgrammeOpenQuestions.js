import React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Box,
  CircularProgress,
  Typography,
  Divider,
  makeStyles,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import useProgrammeOpenQuestions from '../../hooks/useProgrammeOpenQuestions'
import { filterCoursesWithNoResponses } from './utils'

const useStyles = makeStyles(() => ({
  courseTitle: {
    textDecoration: 'none',
    color: 'black',
  },
  realisationTitle: {
    textDecoration: 'none',
    color: '#1077A1',
  },
  realisationContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
}))

const RealisationItem = ({ realisation, language, classes }) => {
  const url = `/targets/${realisation.id}`

  return (
    <Box key={realisation.id} className={classes.realisationContainer}>
      {realisation.questions.map(({ question, responses }) => (
        <Box key={`${realisation.id}-${question.id}`}>
          <Typography variant="body1" component="p">
            <Link to={url} className={classes.realisationTitle} replace>
              {question.data.label[language]}
            </Link>
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
  )
}

const ProgrammeOpenQuestions = () => {
  const { code } = useParams()
  const { i18n } = useTranslation()
  const { language } = i18n
  const classes = useStyles()

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
          <Typography component="h6" variant="h6">
            <Link
              to={`/course-summary/${course.code}`}
              className={classes.courseTitle}
              replace
            >{`${course.code} - ${course.name[language]}`}</Link>
          </Typography>
          {course.realisations.map((realisation) => (
            <RealisationItem
              realisation={realisation}
              language={language}
              classes={classes}
            />
          ))}
        </Box>
      ))}
    </div>
  )
}

export default ProgrammeOpenQuestions
