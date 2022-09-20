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
import { Search, SettingsOutlined } from '@mui/icons-material'

import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useOrganisations from '../../hooks/useOrganisations'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'
import Filters from './Filters'

import {
  getAccess,
  useOpenAccordions,
  useAggregatedOrganisationSummaries,
  ORDER_BY_OPTIONS,
} from './utils'
import { LoadingProgress } from '../LoadingProgress'
import Title from '../Title'
import ColumnHeadings from './ColumnHeadings'
import useHistoryState from '../../hooks/useHistoryState'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import { OrganisationLabel } from './Labels'
import errors from '../../util/errorMessage'
import ErrorView from '../ErrorView'

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
    '&:hover': {
      color: (theme) => theme.palette.primary.light,
      background: 'transparent',
    },
  },
}

const OrganisationButton = ({ code, access }) => {
  const { t } = useTranslation()
  if (!access) return null
  const { write } = access

  return (
    <Tooltip
      title={t(
        write
          ? 'courseSummary:programmeSettings'
          : 'courseSummary:programmeSummary',
      )}
      placement="top"
    >
      <IconButton
        id={`settings-button-${code}`}
        component={Link}
        to={`/organisations/${code}/${write ? 'settings' : 'summary'}`}
        size="large"
        sx={styles.settingsButton}
        color="primary"
        disableFocusRipple
      >
        {write ? (
          <SettingsOutlined sx={{ fontSize: '26px' }} />
        ) : (
          <Search sx={{ fontSize: '24px' }} />
        )}
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
  organisationLinks = false,
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
                      organisationLinks && (
                        <td css={{ paddingLeft: '4rem' }}>
                          <OrganisationButton
                            code={code}
                            access={getAccess(id, organisationAccess)}
                          />
                        </td>
                      )
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

const safelyParseDateRange = (dateRange) =>
  dateRange?.startDate && dateRange?.endDate
    ? {
        start: new Date(dateRange.startDate),
        end: new Date(dateRange.endDate),
      }
    : { start: null, end: null }

/**
 * Somebody PLEASE refactor this file and components @TODO
 */
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
    start: null,
    end: null,
  })

  const [orderBy, setOrderBy] = useHistoryState(
    'orderBy',
    ORDER_BY_OPTIONS[0].value,
  )

  const {
    courseSummaryAccessInfo,
    isLoading: defaultDateRangeLoading,
    isLoadingError: isDateLoadingError,
    error: dateLoadingError,
  } = useCourseSummaryAccessInfo()

  const { organisations: organisationAccess } = useOrganisations()

  const resultingDateRange =
    dateRange.start && dateRange.end
      ? dateRange
      : safelyParseDateRange(courseSummaryAccessInfo?.defaultDateRange)

  const {
    organisationSummaries,
    aggregatedOrganisations,
    isLoading,
    isFetching,
    isLoadingError,
    error,
  } = useAggregatedOrganisationSummaries({
    facultyCode,
    code,
    keyword,
    orderBy,
    includeOpenUniCourseUnits,
    dateRange: resultingDateRange,
  })

  const { openAccordions, toggleAccordion } = useOpenAccordions(
    organisationSummaries?.organisations ?? [],
  )

  if (isLoading || defaultDateRangeLoading) {
    return <LoadingProgress />
  }

  if (isDateLoadingError) {
    return (
      <ErrorView
        message={errors.getGeneralError(dateLoadingError)}
        response={dateLoadingError.response}
      />
    )
  }
  if (isLoadingError && !organisationSummaries) {
    return (
      <ErrorView
        message={errors.getGeneralError(error)}
        response={error.response}
      />
    )
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
        <Box mt={1} />
        <Typography variant="body1" component="h2">
          {t(
            code
              ? 'courseSummary:programmeLevelQuestions'
              : 'courseSummary:universityLevelQuestions',
          )}
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
        organisationLinks={!code}
        filters={
          <Filters
            facultyCode={!code && isAdmin && facultyCode}
            keyword={keyword}
            onFacultyChange={handleFacultyChange}
            onKeywordChange={handleKeywordChange}
            includeOpenUniCourseUnits={includeOpenUniCourseUnits}
            onIncludeOpenUniCourseUnitsChange={
              handleIncludeOpenUniCourseUnitsChange
            }
            dateRange={resultingDateRange}
            onDateRangeChange={setDateRange}
          />
        }
      />
    </>
  )
}

export default OrganisationSummary
