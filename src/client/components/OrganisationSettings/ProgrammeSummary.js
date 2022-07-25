import React, { Fragment } from 'react'
/** @jsxImportSource @emotion/react */

import { useQueryClient } from 'react-query'

import {
  Box,
  TableContainer,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material'

import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import ResultsRow from '../CourseSummary/ResultsRow'
import CourseUnitSummary from '../CourseSummary/CourseUnitSummary'
import DividerRow from '../CourseSummary/DividerRow'
import Filters from '../CourseSummary/Filters'

import {
  ORDER_BY_OPTIONS,
  filterByCourseCode,
  orderByCriteria,
} from '../CourseSummary/utils'

import { getLanguageValue } from '../../util/languageUtils'
import useOrganisationSummary from '../../hooks/useOrganisationSummary'
import { LoadingProgress } from '../LoadingProgress'
import ColumnHeadings from '../CourseSummary/ColumnHeadings'
import useHistoryState from '../../hooks/useHistoryState'

const styles = {
  filtersCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: '1rem',
  },
  progressCell: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: '12px',
  },
}

// A lot taken from OrganisationSummary.js
const ProgrammeTable = ({
  organisations,
  questions,
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
            <th aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={99} css={styles.progressCell}>
              <Box height="0px" position="absolute">
                {loading && <LinearProgress />}
              </Box>
            </td>
          </tr>
          {organisations.map(
            ({
              code,
              id,
              name,
              results,
              feedbackCount,
              feedbackResponsePercentage,
              courseUnits,
              studentCount,
            }) => (
              <Fragment key={id}>
                <ResultsRow
                  id={id}
                  label={
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption" color="textSecondary">
                        {code}
                      </Typography>
                      {getLanguageValue(name, i18n.language)}
                    </Box>
                  }
                  results={results}
                  questions={questions}
                  feedbackCount={feedbackCount}
                  studentCount={studentCount}
                  feedbackResponsePercentage={feedbackResponsePercentage}
                  accordionEnabled={courseUnits.length > 0}
                  accordionInitialOpen
                  onToggleAccordion={() => null}
                  cellsAfter={<td />}
                >
                  <CourseUnitSummary
                    courseUnits={courseUnits}
                    questions={questions}
                  />
                </ResultsRow>
                <DividerRow />
              </Fragment>
            ),
          )}
        </tbody>
      </table>
    </TableContainer>
  )
}

const ProgrammeSummary = () => {
  const { code } = useParams()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useHistoryState('keyword', '')
  const [orderBy, setOrderBy] = useHistoryState(
    'orderBy',
    ORDER_BY_OPTIONS[0].value,
  )
  const [includeOpenUniCourseUnits, setIncludeOpenUniCourseUnits] =
    useHistoryState('includeOpenUniCourseUnits', false)

  const { data, isLoading, isFetching } = useOrganisationSummary(code, {
    includeOpenUniCourseUnits,
    keepPreviousData: true,
  })

  const handleKeywordChange = (nextKeyword) => {
    setKeyword(nextKeyword)
  }

  const handleIncludeOpenUniCourseUnitsChange = (
    nextIncludeOpenUniCourseUnits,
  ) => {
    setIncludeOpenUniCourseUnits(nextIncludeOpenUniCourseUnits)
    queryClient.invalidateQueries('organisationSummary')
  }

  const handleOrderByChange = (nextOrderBy) => {
    setOrderBy(nextOrderBy)
  }

  if (isLoading) {
    return <LoadingProgress />
  }

  const { organisations, summaryQuestions } = data

  const filteredOrganisations = filterByCourseCode(organisations ?? [], keyword)
  const sortedOrganisations = orderByCriteria(filteredOrganisations, orderBy)

  return (
    <ProgrammeTable
      organisations={sortedOrganisations}
      questions={summaryQuestions}
      loading={isFetching}
      onOrderByChange={handleOrderByChange}
      filters={
        <>
          <Box mb={2}>
            <Filters
              keyword={keyword}
              onKeywordChange={handleKeywordChange}
              includeOpenUniCourseUnits={includeOpenUniCourseUnits}
              onIncludeOpenUniCourseUnitsChange={
                handleIncludeOpenUniCourseUnitsChange
              }
            />
          </Box>
          <Divider />
        </>
      }
    />
  )
}

export default ProgrammeSummary
