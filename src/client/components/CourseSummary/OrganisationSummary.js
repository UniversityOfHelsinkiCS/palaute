import React, { Fragment, useState, useMemo } from 'react'

import {
  Box,
  CircularProgress,
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

import { Redirect, Link, useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SettingsIcon from '@material-ui/icons/Settings'

import useOrganisationSummaries from '../../hooks/useOrganisationSummaries'
import useOrganisations from '../../hooks/useOrganisations'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import VerticalHeading from './VerticalHeading'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'
import Filters from './Filters'

import {
  filterByCourseCode,
  hasWriteAccess,
  getInitialOpenAccordions,
} from './utils'

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
  },
}))

const SettingsButton = ({ code }) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={t('courseSummary:editProgrammeSettings')}>
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
            <th> </th>
            {questions.map(({ id, data }) => (
              <VerticalHeading key={id}>
                {getLanguageValue(data?.label, i18n.language)}
              </VerticalHeading>
            ))}
            <VerticalHeading>
              {t('courseSummary:feedbackCount')}
            </VerticalHeading>
            <VerticalHeading>
              {t('courseSummary:feedbackResponse')}
            </VerticalHeading>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={99} className={classes.progressCell}>
                <LinearProgress />
              </td>
            </tr>
          )}
          {organisations.map(
            ({ code, id, name, results, feedbackCount, courseUnits }) => (
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
  const history = useHistory()

  const historyState = history.location.state ?? {}

  const replaceHistoryState = (update) => {
    history.replace({
      state: { ...historyState, ...update },
    })
  }

  const [keyword, setKeyword] = useState(historyState.keyword ?? '')

  const [includeOpenUniCourseUnits, setIncludeOpenUniCourseUnits] = useState(
    historyState.includeOpenUniCourseUnits ?? true,
  )

  const { organisations: organisationAccess } = useOrganisations()

  const { organisationSummaries, isLoading, isFetching } =
    useOrganisationSummaries({
      includeOpenUniCourseUnits,
      keepPreviousData: true,
    })

  const filteredOrganisations = useMemo(
    () =>
      filterByCourseCode(organisationSummaries?.organisations ?? [], keyword),
    [organisationSummaries?.organisations, keyword],
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!organisationSummaries) {
    return <Redirect to="/" />
  }

  const { questions, organisations } = organisationSummaries

  const openAccordions = getInitialOpenAccordions(organisations, history)

  const handleToggleAccordion = (id) => {
    let nextOpenAccordions = openAccordions

    if (openAccordions.includes(id)) {
      nextOpenAccordions = openAccordions.filter((a) => a !== id)
    } else {
      nextOpenAccordions = openAccordions.concat(id)
    }

    replaceHistoryState({ openAccordions: nextOpenAccordions })
  }

  const handleKeywordChange = (nextKeyword) => {
    setKeyword(nextKeyword)
    replaceHistoryState({ keyword: nextKeyword })
  }

  const handleIncludeOpenUniCourseUnitsChange = (
    nextIncludeOpenUniCourseUnits,
  ) => {
    setIncludeOpenUniCourseUnits(nextIncludeOpenUniCourseUnits)

    replaceHistoryState({
      includeOpenUniCourseUnits: nextIncludeOpenUniCourseUnits,
    })
  }

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('courseSummary:heading')}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <OrganisationTable
            organisations={filteredOrganisations}
            questions={questions}
            organisationAccess={organisationAccess}
            initialOpenAccordions={openAccordions}
            onToggleAccordion={handleToggleAccordion}
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
