import React, { Fragment } from 'react'
/** @jsxImportSource @emotion/react */

import { Link, useParams } from 'react-router-dom'

import { Box, Typography, TableContainer, Link as MuiLink } from '@mui/material'

import { useTranslation } from 'react-i18next'

import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'
import { getLanguageValue } from '../../util/languageUtils'
import { getFeedbackResponseGiven } from './utils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import Title from '../../components/common/Title'
import { CourseRealisationLabel } from './Labels'
import useOrganisations from '../../hooks/useOrganisations'
import ErrorView from '../../components/common/ErrorView'
import errors from '../../util/errorMessage'
import ColumnHeadings from './ColumnHeadings'
import CensoredCount from './CensoredCount'

const styles = {
  table: {
    borderSpacing: '2px 0.8rem',
  },
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

const CourseRealisationTable = ({ courseRealisations, questions, access }) => {
  const { t, i18n } = useTranslation()

  return (
    <TableContainer sx={{ p: 1, pt: 5 }}>
      <table css={styles.table}>
        <thead>
          <tr>
            <th css={styles.realisationHeading}>{t('courseSummary:courseRealisation')}</th>
            <ColumnHeadings questions={questions} />
          </tr>
        </thead>
        <tbody>
          {courseRealisations.map(courseRealisation => {
            const feedbackResponseGiven = getFeedbackResponseGiven(
              courseRealisation.feedbackResponseGiven,
              courseRealisation.closesAt
            )

            return (
              <Fragment key={courseRealisation.id}>
                <ResultsRow
                  key={courseRealisation.id}
                  label={<CourseRealisationLabel courseRealisation={courseRealisation} language={i18n.language} />}
                  results={courseRealisation.results}
                  questions={questions}
                  feedbackCount={courseRealisation.feedbackCount}
                  studentCount={courseRealisation.studentCount}
                  feedbackResponseGiven={feedbackResponseGiven}
                  currentFeedbackTargetId={courseRealisation.feedbackTargetId}
                  accordionCellEnabled={false}
                  cellsAfter={
                    access?.admin &&
                    !!courseRealisation.hiddenCount && (
                      <>
                        <td />
                        <td>
                          <CensoredCount count={courseRealisation.hiddenCount} />
                        </td>
                      </>
                    )
                  }
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

  const { organisations, isLoading: organisationsLoading, isLoadingError: orgError } = useOrganisations({ retry: 2 })
  const {
    courseRealisationSummaries,
    isLoading,
    isLoadingError: summaryError,
    error,
  } = useCourseRealisationSummaries(code, { retry: 1 })

  if (isLoading) {
    return <LoadingProgress />
  }

  if ((summaryError || orgError) && !courseRealisationSummaries) {
    return <ErrorView message={errors.getGeneralError(error)} response={error?.response} />
  }

  const { questions, courseRealisations, courseUnit } = courseRealisationSummaries

  const organisation = organisationsLoading
    ? null
    : organisations.find(org => org.id === courseUnit.organisations[0]?.id)

  return (
    <>
      <Title>{t('courseSummaryPage')}</Title>
      <Box mb="1rem">
        <Typography variant="h4" component="h1">
          {getLanguageValue(courseUnit.name, i18n.language)}, {courseUnit.courseCode}
        </Typography>
        <Box mb={1} />
        {organisation && (
          <MuiLink component={Link} to={`/organisations/${organisation.code}`} underline="hover">
            {getLanguageValue(organisation.name, i18n.language)}
          </MuiLink>
        )}
      </Box>
      <Typography variant="body1" component="h2">
        {t('courseSummary:universityLevelQuestions')}
      </Typography>
      <CourseRealisationTable
        courseRealisations={courseRealisations}
        questions={questions}
        access={organisation?.access}
      />
    </>
  )
}

export default CourseRealisationSummary
