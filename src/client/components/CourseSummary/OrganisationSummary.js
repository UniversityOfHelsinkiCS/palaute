/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { Fragment } from 'react'
/** @jsxImportSource @emotion/react */

import {
  Box,
  Typography,
  TableContainer,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import { SettingsOutlined } from '@mui/icons-material'

import { Redirect, Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useOrganisations from '../../hooks/useOrganisations'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'
import Filters from './Filters'

import {
  hasWriteAccess,
  useOpenAccordions,
  useAggregatedOrganisationSummaries,
  ORDER_BY_OPTIONS,
} from './utils'
import { LoadingProgress } from '../LoadingProgress'
import Title from '../Title'
import ColumnHeadings from './ColumnHeadings'
import useHistoryState from '../../hooks/useHistoryState'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { OrganisationLabel } from './Labels'

const styles = {
  filtersCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: '0 1rem 1rem 1rem',
  },
  progressCell: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: '12px',
  },
  settingsButton: {
    marginX: 4,
    '&:hover': {
      color: (theme) => theme.palette.primary.light,
      background: 'transparent',
    },
  },
}

const SettingsButton = ({ code }) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={t('courseSummary:programmePage')} placement="right">
      <IconButton
        id={`settings-button-${code}`}
        component={Link}
        to={`/organisations/${code}/settings`}
        size="large"
        sx={styles.settingsButton}
        color="primary"
        disableFocusRipple
      >
        <SettingsOutlined sx={{ fontSize: '26px' }} />
      </IconButton>
    </Tooltip>
  )
}

const OrganisationTable = ({
  organisations,
  questions,
  organisationAccess,
  initialOpenAccordions = [],
  onToggleAccordion = () => {},
  onOrderByChange,
  filters,
  loading = false,
}) => {
  const { t, i18n } = useTranslation()

  return (
    <TableContainer sx={{ overflow: 'visible' }}>
      <table>
        <thead>
          <tr>
            <th css={styles.filtersCell}>{filters}</th>

            <ColumnHeadings
              onOrderByChange={onOrderByChange}
              questionNames={questions
                .map(({ id, data }) => ({
                  id,
                  question: getLanguageValue(data?.label, i18n.language),
                }))
                .concat([
                  { id: 0, question: t('courseSummary:feedbackCount') },
                  { id: 1, question: t('courseSummary:feedbackPercentage') },
                  { id: 2, question: t('courseSummary:feedbackResponse') },
                ])}
            />
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={99} css={styles.progressCell}>
                <LinearProgress />
              </td>
            </tr>
          )}

          {!loading &&
            organisations.map(
              ({
                code,
                id,
                name,
                results,
                feedbackCount,
                courseUnits,
                studentCount,
                feedbackResponsePercentage,
              }) => (
                <Fragment key={id}>
                  <ResultsRow
                    id={id}
                    label={
                      <OrganisationLabel
                        name={getLanguageValue(name, i18n.language)}
                        code={code}
                      />
                    }
                    results={results}
                    questions={questions}
                    feedbackCount={feedbackCount}
                    studentCount={studentCount}
                    feedbackResponsePercentage={feedbackResponsePercentage}
                    accordionEnabled={courseUnits.length > 0}
                    accordionInitialOpen={initialOpenAccordions.includes(id)}
                    onToggleAccordion={() => onToggleAccordion(id)}
                    cellsAfter={
                      <td>
                        {hasWriteAccess(id, organisationAccess) && (
                          <SettingsButton code={code} />
                        )}
                      </td>
                    }
                  >
                    <CourseUnitSummary
                      courseUnits={courseUnits}
                      questions={questions}
                    />
                  </ResultsRow>
                  <DividerRow height={1.3} />
                </Fragment>
              ),
            )}
        </tbody>
      </table>
    </TableContainer>
  )
}

const OrganisationSummary = () => {
  const { t } = useTranslation()
  const { code } = useParams()

  const { authorizedUser, isLoading: authorizedUserLoading } =
    useAuthorizedUser()
  const isAdmin = !authorizedUserLoading && authorizedUser?.isAdmin

  const [facultyCode, setFacultyCode] = useHistoryState('facultyCode', 'All')
  const [keyword, setKeyword] = useHistoryState('keyword', '')

  const [includeOpenUniCourseUnits, setIncludeOpenUniCourseUnits] =
    useHistoryState('includeOpenUniCourseUnits', false)

  const [dateRange, setDateRange] = useHistoryState('dateRange', {
    // Update to next year in November
    start: new Date(`2021-08-01`),
    end: new Date('2022-08-01'),
  })

  const [orderBy, setOrderBy] = useHistoryState(
    'orderBy',
    ORDER_BY_OPTIONS[0].value,
  )

  const { organisations: organisationAccess } = useOrganisations()

  const {
    organisationSummaries,
    aggregatedOrganisations,
    isLoading,
    isFetching,
    failureCount,
  } = useAggregatedOrganisationSummaries({
    facultyCode,
    code,
    keyword,
    orderBy,
    includeOpenUniCourseUnits,
    dateRange,
  })

  const { openAccordions, toggleAccordion } = useOpenAccordions(
    organisationSummaries?.organisations ?? [],
  )

  if (isLoading) {
    return (
      <LoadingProgress
        isError={failureCount > 1}
        message={t('common:fetchError')}
      />
    )
  }

  if (!organisationSummaries) {
    return <Redirect to="/" />
  }

  const { questions } = organisationSummaries

  const handleFacultyChange = (newFaculty) => {
    setFacultyCode(newFaculty)
  }

  const handleKeywordChange = (nextKeyword) => {
    setKeyword(nextKeyword)
  }

  const handleIncludeOpenUniCourseUnitsChange = (
    nextIncludeOpenUniCourseUnits,
  ) => {
    setIncludeOpenUniCourseUnits(nextIncludeOpenUniCourseUnits)
  }

  const handleOrderByChange = (nextOrderBy) => {
    setOrderBy(nextOrderBy)
  }

  return (
    <>
      <Title>{t('courseSummaryPage')}</Title>
      <Box mt={2} mb={6}>
        <Typography variant="h4" component="h1">
          {t('courseSummary:heading')}
        </Typography>
      </Box>
      <OrganisationTable
        organisations={aggregatedOrganisations}
        questions={questions}
        organisationAccess={organisationAccess}
        initialOpenAccordions={openAccordions}
        onToggleAccordion={toggleAccordion}
        loading={isFetching}
        onOrderByChange={handleOrderByChange}
        filters={
          <Filters
            facultyCode={
              isAdmin && aggregatedOrganisations.length > 1 && facultyCode
            }
            keyword={keyword}
            onFacultyChange={handleFacultyChange}
            onKeywordChange={handleKeywordChange}
            includeOpenUniCourseUnits={includeOpenUniCourseUnits}
            onIncludeOpenUniCourseUnitsChange={
              handleIncludeOpenUniCourseUnitsChange
            }
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        }
      />
    </>
  )
}

export default OrganisationSummary
