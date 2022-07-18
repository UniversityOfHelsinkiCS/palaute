import React, { Fragment } from 'react'

import {
  Box,
  Typography,
  TableContainer,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Container,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

import { Redirect, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SettingsIcon from '@mui/icons-material/Settings'

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

const useStyles = makeStyles((theme) => ({
  filtersCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: theme.spacing(2, 2, 2, 0),
  },
  progressCell: {
    padding: theme.spacing(1, 0),
    minHeight: '12px',
  },
}))

const SettingsButton = ({ code }) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={t('courseSummary:programmePage')}>
      <IconButton
        id={`settings-button-${code}`}
        component={Link}
        to={`/organisations/${code}/settings`}
        size="large"
      >
        <SettingsIcon />
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
  const classes = useStyles()

  return (
    <TableContainer sx={{ overflow: 'visible' }}>
      <table>
        <thead>
          <tr>
            <th className={classes.filtersCell}>{filters}</th>

            <ColumnHeadings
              onOrderByChange={onOrderByChange}
              questionNames={questions
                .map(({ id, data }) => ({
                  id,
                  question: getLanguageValue(data?.label, i18n.language),
                }))
                .concat([
                  { id: 0, question: t('courseSummary:feedbackCount') },
                  { id: 1, question: t('courseSummary:feedbackResponse') },
                ])}
            />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={99} className={classes.progressCell}>
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

  const [keyword, setKeyword] = useHistoryState('keyword', '')

  const [includeOpenUniCourseUnits, setIncludeOpenUniCourseUnits] =
    useHistoryState('includeOpenUniCourseUnits', false)

  const [dateRange, setDateRange] = useHistoryState('dateRange', {
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
    keyword,
    orderBy,
    includeOpenUniCourseUnits,
    dateRange,
    organisationAccess,
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
      <Box mt={2}>
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
          <>
            <Box mb={2}>
              <Filters
                keyword={keyword}
                onKeywordChange={handleKeywordChange}
                includeOpenUniCourseUnits={includeOpenUniCourseUnits}
                onIncludeOpenUniCourseUnitsChange={
                  handleIncludeOpenUniCourseUnitsChange
                }
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </Box>
            <Divider />
          </>
        }
      />
    </>
  )
}

export default OrganisationSummary
