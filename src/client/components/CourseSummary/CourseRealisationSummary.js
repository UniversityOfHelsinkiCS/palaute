import React, { Fragment } from 'react'
/** @jsxImportSource @emotion/react */

import { Link, Redirect, useParams } from 'react-router-dom'

import {
  Box,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Link as MuiLink,
} from '@mui/material'

import { useTranslation } from 'react-i18next'

import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'
import { getLanguageValue } from '../../util/languageUtils'
import VerticalHeading from './VerticalHeading'
import { getFeedbackResponseGiven } from './utils'
import { LoadingProgress } from '../LoadingProgress'
import Title from '../Title'
import { CourseRealisationLabel } from './Labels'
import useOrganisations from '../../hooks/useOrganisations'

const styles = {
  realisationHeading: {
    textAlign: 'left',
    verticalAlign: 'Bottom',
    paddingLeft: '0.5rem',
    paddingBottom: '0.5rem',
  },
  languageRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
}

const CourseRealisationTable = ({ courseRealisations, questions }) => {
  const { t, i18n } = useTranslation()

  return (
    <TableContainer sx={{ p: 1, pt: 5 }}>
      <table>
        <thead>
          <tr>
            <th css={styles.realisationHeading}>
              {t('courseSummary:courseRealisation')}
            </th>
            {questions.map(({ id, data }) => (
              <VerticalHeading key={id}>
                {getLanguageValue(data?.label, i18n.language)}
              </VerticalHeading>
            ))}
            <VerticalHeading>
              {t('courseSummary:feedbackCount')}
            </VerticalHeading>
            <VerticalHeading>
              {t('courseSummary:feedbackPercentage')}
            </VerticalHeading>
            <VerticalHeading>
              {t('courseSummary:feedbackResponse')}
            </VerticalHeading>
          </tr>
        </thead>
        <tbody>
          {courseRealisations.map((courseRealisation) => {
            const feedbackResponseGiven = getFeedbackResponseGiven(
              courseRealisation.feedbackResponseGiven,
              courseRealisation.closesAt,
            )

            return (
              <Fragment key={courseRealisation.id}>
                <ResultsRow
                  key={courseRealisation.id}
                  label={
                    <CourseRealisationLabel
                      courseRealisation={courseRealisation}
                      language={i18n.language}
                    />
                  }
                  results={courseRealisation.results}
                  questions={questions}
                  feedbackCount={courseRealisation.feedbackCount}
                  studentCount={courseRealisation.studentCount}
                  feedbackResponseGiven={feedbackResponseGiven}
                  currentFeedbackTargetId={courseRealisation.feedbackTargetId}
                  accordionCellEnabled={false}
                />
                <DividerRow height={1.3} />
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </TableContainer>
  )
}

const CourseRealisationSummary = () => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()

  const { organisations, isLoading: organisationsLoading } = useOrganisations()
  const { courseRealisationSummaries, isLoading, failureCount } =
    useCourseRealisationSummaries(code)

  if (isLoading) {
    return (
      <LoadingProgress
        isError={failureCount > 1}
        message={t('common:fetchError')}
      />
    )
  }

  if (!courseRealisationSummaries) {
    return <Redirect to="/" />
  }

  const { questions, courseRealisations, courseUnit } =
    courseRealisationSummaries

  const organisation = organisationsLoading
    ? null
    : organisations.find((org) => org.id === courseUnit.organisations[0]?.id)

  return (
    <>
      <Title>{t('courseSummaryPage')}</Title>
      <Box mb={4}>
        <Typography variant="h4" component="h1">
          {getLanguageValue(courseUnit.name, i18n.language)},{' '}
          {courseUnit.courseCode}
        </Typography>
        <Box mb={1} />
        {organisation && (
          <MuiLink
            component={Link}
            to={`/organisations/${organisation.code}/settings`}
          >
            {getLanguageValue(organisation.name, i18n.language)}
          </MuiLink>
        )}
      </Box>
      <Card>
        <CardContent>
          <CourseRealisationTable
            courseRealisations={courseRealisations}
            questions={questions}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default CourseRealisationSummary
