import React, { useState, useRef, forwardRef } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Divider, Link } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import useProgrammeOpenQuestions from '../../hooks/useProgrammeOpenQuestions'
import { filterCoursesWithNoResponses, filterCoursesByDate, formateDates } from './utils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import useHistoryState from '../../hooks/useHistoryState'
import ExportButton from '../../components/common/ExportButton'
import { NorButton } from '../../components/common/NorButton'

const styles = {
  courseTitle: {
    textDecoration: 'none',
  },
  realisationTitle: {
    textDecoration: 'none',
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
  button: {
    maxHeight: 45,
    color: 'black',
    background: 'white',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: 'white',
      boxShadow: 'none',
    },
  },
}

const RealisationItem = ({ realisation, language }) => {
  const url = `/targets/${realisation.id}/results`

  const realisationDates = formateDates(realisation)

  return (
    <Box key={realisation.id} sx={styles.realisationContainer}>
      <Link href={url} style={styles.realisationTitle} replace>
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

  if (dateRange) filteredCourses = filterCoursesByDate(filteredCourses, dateRange)

  return (
    <span ref={ref}>
      {filteredCourses.map(course => (
        <Box key={course.code} mb="4rem">
          <Typography component="h6" variant="h6">
            <Link
              href={`/course-summary/course-unit/${course.code}`}
              style={styles.courseTitle}
              replace
            >{`${course.code} - ${course.name[language]}`}</Link>
          </Typography>
          {course.realisations.map(realisation => (
            <RealisationItem key={realisation.id} realisation={realisation} language={language} />
          ))}
        </Box>
      ))}
    </span>
  )
})

const ExportPdfLink = ({ componentRef }) => {
  const { t } = useTranslation()

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  })

  return (
    <NorButton sx={styles.button} onClick={handlePrint}>
      {t('common:exportPdf')}
    </NorButton>
  )
}

const ProgrammeOpenQuestions = () => {
  const { code } = useParams()
  const { t } = useTranslation()

  const { codesWithIds, isLoading } = useProgrammeOpenQuestions(code)

  const [dateRange, setDateRange] = useHistoryState('dateRange', {
    start: new Date(`2022-08-01`),
    end: new Date('2023-08-01'),
  })

  const [option, setOption] = useState('all')

  const componentRef = useRef()

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <YearSemesterSelector value={dateRange} onChange={setDateRange} option={option} setOption={setOption} allowAll />
      <Box sx={styles.buttonContainer}>
        <ExportButton label={t('feedbackTargetResults:export')}>
          <ExportPdfLink componentRef={componentRef} />
        </ExportButton>
      </Box>
      <OpenQuestions codesWithIds={codesWithIds} dateRange={option !== 'all' && dateRange} ref={componentRef} />
    </Box>
  )
}

export default ProgrammeOpenQuestions
