/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react'
/** @jsxImportSource @emotion/react */

import { Box, Typography } from '@mui/material'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useOrganisations from '../../hooks/useOrganisations'
import Filters from './Filters'

import {
  useOpenAccordions,
  useAggregatedOrganisationSummaries,
  ORDER_BY_OPTIONS,
} from './utils'
import { LoadingProgress } from '../common/LoadingProgress'
import Title from '../common/Title'
import useHistoryState from '../../hooks/useHistoryState'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import errors from '../../util/errorMessage'
import ErrorView from '../common/ErrorView'
import OrganisationTable from './OrganisationTable'

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

  const {
    courseSummaryAccessInfo,
    isLoading: defaultDateRangeLoading,
    isLoadingError: isDateLoadingError,
    error: dateLoadingError,
  } = useCourseSummaryAccessInfo()

  const { organisations: organisationAccess } = useOrganisations()

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
