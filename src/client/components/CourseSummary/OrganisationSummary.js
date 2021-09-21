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
  TextField,
  InputAdornment,
} from '@material-ui/core'

import { Redirect, Link, useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SettingsIcon from '@material-ui/icons/Settings'
import SearchIcon from '@material-ui/icons/Search'

import useOrganisationSummaries from '../../hooks/useOrganisationSummaries'
import useOrganisations from '../../hooks/useOrganisations'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import VerticalHeading from './VerticalHeading'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'

import {
  filterByCourseCode,
  hasWriteAccess,
  getInitialOpenAccordions,
} from './utils'

const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: '2px',
  },
  searchCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: theme.spacing(2),
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
  keyword = '',
  onKeywordChange = () => {},
}) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <TableContainer>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.searchCell}>
              <TextField
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                variant="outlined"
                placeholder={t('courseSummary:searchPlaceholder')}
                label={t('courseSummary:searchLabel')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </th>
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

  const [keyword, setKeyword] = useState(historyState.searchKeyword ?? '')
  const { organisations: organisationAccess } = useOrganisations()
  const { organisationSummaries, isLoading } = useOrganisationSummaries()

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

    history.replace({
      state: { ...historyState, openAccordions: nextOpenAccordions },
    })
  }

  const handleKeywordChange = (nextKeyword) => {
    setKeyword(nextKeyword)

    history.replace({
      state: { ...historyState, searchKeyword: nextKeyword },
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
            keyword={keyword}
            onKeywordChange={handleKeywordChange}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default OrganisationSummary
