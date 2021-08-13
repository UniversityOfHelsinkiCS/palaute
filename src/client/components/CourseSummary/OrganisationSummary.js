import React, { Fragment, useState } from 'react'

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

const useStyles = makeStyles({
  table: {
    borderSpacing: '2px',
  },
})

const hasWriteAccess = (organisationId, organisationAccess) =>
  Boolean(
    (organisationAccess ?? []).find(({ id }) => id === organisationId)?.access
      .write,
  )

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
}) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  const history = useHistory()
  const [openAccordions, setOpenAccordions] = useState(
    history.location.state ? history.location.state : [],
  )

  const updateOpenAccordions = async (id) => {
    if (openAccordions.includes(id)) {
      setOpenAccordions(openAccordions.filter((a) => a !== id))
      history.replace({ state: openAccordions.filter((a) => a !== id) })
    } else {
      setOpenAccordions(openAccordions.concat(id))
      history.replace({ state: openAccordions.concat(id) })
    }
  }

  return (
    <TableContainer>
      <table className={classes.table}>
        <thead>
          <tr>
            <th> </th>
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
                  cellsAfter={
                    <td>
                      {hasWriteAccess(id, organisationAccess) && (
                        <SettingsButton code={code} />
                      )}
                    </td>
                  }
                  openAccordions={openAccordions}
                  updateOpenAccordions={updateOpenAccordions}
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
  const { organisations: organisationAccess } = useOrganisations()
  const { organisationSummaries, isLoading } = useOrganisationSummaries()

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
            organisations={organisations}
            questions={questions}
            organisationAccess={organisationAccess}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default OrganisationSummary
