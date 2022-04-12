import React, { Fragment } from 'react'

import {
  Box,
  Card,
  CardContent,
  Typography,
  TableContainer,
  IconButton,
  Tooltip,
  makeStyles,
  Divider,
  LinearProgress,
} from '@material-ui/core'

import { Redirect, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SettingsIcon from '@material-ui/icons/Settings'

import useOrganisations from '../../hooks/useOrganisations'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import VerticalHeading from './VerticalHeading'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'
import Filters from './Filters'

import {
  hasWriteAccess,
  useHistoryState,
  useOpenAccordions,
  useAggregatedOrganisationSummaries,
  ORDER_BY_OPTIONS,
} from './utils'
import { LoadingProgress } from '../LoadingProgress'
import Title from '../Title'
import ColumnHeadings from './ColumnHeadings'

const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: '2px',
  },
  filtersCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: theme.spacing(2),
  },
  progressCell: {
    padding: theme.spacing(1, 2),
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
  filters,
  loading = false,
}) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <TableContainer>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.filtersCell}>{filters}</th>
            <th aria-hidden="true" />

            <ColumnHeadings
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
            <th aria-hidden="true" />
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
                    <>
                      {getLanguageValue(name, i18n.language)} ({code})
                    </>
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
                <DividerRow />
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
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('courseSummary:heading')}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <OrganisationTable
            organisations={aggregatedOrganisations}
            questions={questions}
            organisationAccess={organisationAccess}
            initialOpenAccordions={openAccordions}
            onToggleAccordion={toggleAccordion}
            loading={isFetching}
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
                    orderBy={orderBy}
                    onOrderByChange={handleOrderByChange}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </Box>
                <Divider />
              </>
            }
          />
        </CardContent>
      </Card>
    </>
  )
}

export default OrganisationSummary
