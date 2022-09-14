import React, { useState, useRef, forwardRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box, Typography, Divider, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import useProgrammeOpenQuestions from '../../hooks/useProgrammeOpenQuestions'
import {
  filterCoursesWithNoResponses,
  filterCoursesByDate,
  formateDates,
} from './utils'
import { LoadingProgress } from '../LoadingProgress'
import { YearSemesterSelector } from '../CourseSummary/YearSemesterSelector'
import useHistoryState from '../../hooks/useHistoryState'

const styles = {
  courseTitle: {
    textDecoration: 'none',
    color: '#1077A1',
  },
  realisationTitle: {
    textDecoration: 'none',
    color: '#0084bb',
    fontSize: 'large',
  },
  realisationContainer: {
    marginTop: 4,
    marginBottom: 6,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    '@media print': {
      display: 'none',
    },
  },
  response: {
    margin: 2,
  },
  questionTitle: {
    fontWeight: 500,
  },
  dates: {
    color: '#646464',
    marginBottom: 3,
  },
}

const RealisationItem = ({ realisation, language }) => {
  const url = `/targets/${realisation.id}/results`

  const realisationDates = formateDates(realisation)

  return (
    <Box key={realisation.id} sx={styles.realisationContainer}>
      <Link to={url} sx={styles.realisationTitle} replace>
        {realisation.name[language]}
      </Link>
      <Typography variant="body2" component="p" sx={styles.dates}>
        {realisationDates}
      </Typography>
      {realisation.questions.map(({ question, responses }) => (
        <Box key={`${realisation.id}-${question.id}`}>
          <Typography variant="body1" component="p" sx={styles.questionTitle}>
            {question.data.label[language]}
          </Typography>
          <Box my={1}>
            {responses.map((r, index) => (
              <div key={index}>
                <Typography variant="body2" component="p" sx={styles.response}>
                  {r}
                </Typography>
                <Divider style={{ margin: 2 }} />
              </div>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const OpenQuestions = forwardRef(({ codesWithIds, dateRange }, ref) => {
  const { i18n } = useTranslation()
  const { language } = i18n

  let filteredCourses = filterCoursesWithNoResponses(codesWithIds)

  if (dateRange)
    filteredCourses = filterCoursesByDate(filteredCourses, dateRange)

  return (
    <span ref={ref}>
      {filteredCourses.map((course) => (
        <Box key={course.code} mb="4rem">
          <Typography component="h6" variant="h6">
            <Link
              to={`/course-summary/${course.code}`}
              sx={styles.courseTitle}
              replace
            >{`${course.code} - ${course.name[language]}`}</Link>
          </Typography>
          {course.realisations.map((realisation) => (
            <RealisationItem
              key={realisation.id}
              realisation={realisation}
              language={language}
            />
          ))}
        </Box>
      ))}
    </span>
  )
})

const ProgrammeOpenQuestions = () => {
  const { code } = useParams()
  const { t } = useTranslation()

  const { codesWithIds, isLoading } = useProgrammeOpenQuestions(code)

  const [dateRange, setDateRange] = useHistoryState('dateRange', {
    // Update to next year in November
    start: new Date(`2021-08-01`),
    end: new Date('2022-08-01'),
  })

  const [option, setOption] = useState('all')

  const componentRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <YearSemesterSelector
        value={dateRange}
        onChange={setDateRange}
        option={option}
        setOption={setOption}
        allowAll
      />
      <Box sx={styles.buttonContainer}>
        <Button color="primary" variant="contained" onClick={handlePrint}>
          {t('feedbackTargetResults:exportPdf')}
        </Button>
      </Box>
      <OpenQuestions
        codesWithIds={codesWithIds}
        dateRange={option !== 'all' && dateRange}
        ref={componentRef}
      />
    </Box>
  )
}

export default ProgrammeOpenQuestions
