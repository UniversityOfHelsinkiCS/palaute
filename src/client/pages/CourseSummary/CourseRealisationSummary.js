import React, { Fragment } from 'react'
/** @jsxImportSource @emotion/react */

import { useParams } from 'react-router-dom'

import { Box, Typography, TableContainer, Alert } from '@mui/material'

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
import LinkButton from '../../components/common/LinkButton'

const styles = {
  realisationHeading: {
    textAlign: 'left',
    verticalAlign: 'Bottom',
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
    <TableContainer>
      <table css={styles.table}>
        <thead>
          <tr>
            <th css={styles.realisationHeading}>{t('courseSummary:courseRealisation')}</th>
            <ColumnHeadings questions={questions} />
          </tr>
        </thead>
        <tbody>
          {courseRealisations.length === 0 && (
            <tr>
              <td colSpan={99}>
                <Box my="1rem" mx="2rem">
                  <Alert severity="info" data-cy="noCourseRealisations">
                    {t('courseSummary:noCourseRealisations')}
                  </Alert>
                </Box>
              </td>
            </tr>
          )}
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

  const coursePageLink = `${t('links:courseUnitPage')}${courseUnit.id}`

  return (
    <>
      <Title>{t('common:courseSummaryPage')}</Title>
      <Box display="flex" flexDirection="column">
        <Box mb="1rem" display="flex" flexWrap="wrap" alignItems="end" gap="1rem">
          <Typography variant="h4" component="h1">
            {getLanguageValue(courseUnit.name, i18n.language)}
          </Typography>
          <Typography variant="h5" color="textSecondary">
            {courseUnit.courseCode}
          </Typography>
        </Box>

        <Box mb={1} display="flex" gap="0.7rem">
          {organisation && (
            <LinkButton
              to={`/organisations/${organisation.code}`}
              title={getLanguageValue(organisation.name, i18n.language)}
            />
          )}
          <LinkButton to={coursePageLink} title={t('feedbackTargetView:coursePage')} external />
        </Box>

        <Typography variant="body1" component="h2">
          {t('courseSummary:universityLevelQuestions')}
        </Typography>
      </Box>

      <CourseRealisationTable
        courseRealisations={courseRealisations}
        questions={questions}
        access={organisation?.access}
      />
    </>
  )
}

export default CourseRealisationSummary
