/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useRef } from 'react'
/** @jsxImportSource @emotion/react */

import { Box, Typography } from '@mui/material'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useOrganisations from '../../hooks/useOrganisations'
import Filters from './Filters'

import { getFacultyAccess, useOpenAccordions, useAggregatedOrganisationSummaries, ORDER_BY_OPTIONS } from './utils'
import Title from '../../components/common/Title'
import useHistoryState from '../../hooks/useHistoryState'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import useOrganisationData from '../../hooks/useOrganisationData'
import errors from '../../util/errorMessage'
import ErrorView from '../../components/common/ErrorView'
import OrganisationTable from './OrganisationTable'
import ExportCourses from './ExportCourses'

const safelyParseDateRange = dateRange =>
  dateRange?.startDate && dateRange?.endDate
    ? {
        start: new Date(dateRange.startDate),
        end: new Date(dateRange.endDate),
      }
    : { start: null, end: null }

/**
 * Somebody PLEASE refactor this file and components @TODO
 * update: tis better now
 */
const OrganisationSummary = () => {
  const { t } = useTranslation()
  const { code } = useParams()

  const {
    courseSummaryAccessInfo,
    isLoading: defaultDateRangeLoading,
    isLoadingError: isDateLoadingError,
    error: dateLoadingError,
  } = useCourseSummaryAccessInfo()

  const { organisations: organisationAccess, isLoading: organisationLoading } = useOrganisations()

  const { data } = useOrganisationData()
  const organisationData = data || []

  const facultyAccess = !organisationLoading && getFacultyAccess(organisationAccess, organisationData)
  const hasMultipleFacultyAccess = facultyAccess.length > 1

  const [facultyCode, setFacultyCode] = useHistoryState('facultyCode', 'All')
  const [tagId, setTagId] = useHistoryState('tagId', 'All')
  const [keyword, setKeyword] = useHistoryState('keyword', '')

  const isEducationBachelorOrMaster = code === '600-K001' || code === '600-M001'

  const [includeOpenUniCourseUnits, setIncludeOpenUniCourseUnits] = useHistoryState('includeOpenUniCourseUnits', false)

  const [dateRange, setDateRange] = useHistoryState('dateRange', {
    start: null,
    end: null,
  })

  const [orderBy, setOrderBy] = useHistoryState('orderBy', ORDER_BY_OPTIONS[0].value)

  const componentRef = useRef()

  const resultingDateRange =
    dateRange.start && dateRange.end ? dateRange : safelyParseDateRange(courseSummaryAccessInfo?.defaultDateRange)

  const {
    organisationSummaries,
    aggregatedOrganisations,
    isLoading: isOrganisationsLoading,
    isFetching,
    isLoadingError,
    error,
  } = useAggregatedOrganisationSummaries({
    facultyCode,
    tagId,
    code,
    keyword,
    orderBy,
    includeOpenUniCourseUnits,
    dateRange: resultingDateRange,
    organisationAccess,
    organisationData,
  })

  const { openAccordions, toggleAccordion } = useOpenAccordions(organisationSummaries?.organisations ?? [])

  if (isDateLoadingError) {
    return <ErrorView message={errors.getGeneralError(dateLoadingError)} response={dateLoadingError.response} />
  }
  if (isLoadingError && !organisationSummaries) {
    return <ErrorView message={errors.getGeneralError(error)} response={error.response} />
  }

  const questions = organisationSummaries?.questions

  const handleFacultyChange = newFaculty => {
    setFacultyCode(newFaculty)
  }

  const handleTagChange = newTagId => {
    setTagId(newTagId)
  }

  const handleKeywordChange = nextKeyword => {
    setKeyword(nextKeyword)
  }

  const handleIncludeOpenUniCourseUnitsChange = nextIncludeOpenUniCourseUnits => {
    setIncludeOpenUniCourseUnits(nextIncludeOpenUniCourseUnits)
  }

  const handleOrderByChange = nextOrderBy => {
    setOrderBy(nextOrderBy)
  }

  return (
    <>
      <Title>{t('courseSummaryPage')}</Title>
      <Box mb={6} px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            {t('courseSummary:heading')}
          </Typography>
          <ExportCourses
            average={organisationSummaries?.averageRow}
            organisations={!isOrganisationsLoading ? aggregatedOrganisations : []}
            questions={questions || []}
            componentRef={componentRef}
          />
        </Box>
        <Box mt={1} />
        <Typography variant="body1" component="h2">
          {t(code ? 'courseSummary:programmeLevelQuestions' : 'courseSummary:universityLevelQuestions')}
        </Typography>
      </Box>
      <OrganisationTable
        average={organisationSummaries?.averageRow}
        organisations={aggregatedOrganisations}
        isOrganisationsLoading={isOrganisationsLoading}
        questions={questions}
        organisationAccess={organisationAccess}
        initialOpenAccordions={openAccordions}
        onToggleAccordion={toggleAccordion}
        onOrderByChange={handleOrderByChange}
        organisationLinks={!code}
        isRefetching={isFetching && organisationSummaries}
        ref={componentRef}
        filters={
          <Filters
            facultyCode={!code && hasMultipleFacultyAccess && facultyCode}
            keyword={keyword}
            facultyAccess={facultyAccess}
            onFacultyChange={handleFacultyChange}
            tagId={isEducationBachelorOrMaster && tagId}
            onTagChange={handleTagChange}
            onKeywordChange={handleKeywordChange}
            includeOpenUniCourseUnits={includeOpenUniCourseUnits}
            onIncludeOpenUniCourseUnitsChange={handleIncludeOpenUniCourseUnitsChange}
            dateRange={resultingDateRange}
            isDateRangeLoading={defaultDateRangeLoading}
            onDateRangeChange={setDateRange}
            componentRef={componentRef}
            organisations={!isOrganisationsLoading ? aggregatedOrganisations : []}
            questions={questions || []}
          />
        }
      />
    </>
  )
}

export default OrganisationSummary
