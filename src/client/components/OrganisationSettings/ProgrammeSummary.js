import React, { Fragment } from 'react'
import { useQueryClient } from 'react-query'

import {
  Box,
  CircularProgress,
  TableContainer,
  makeStyles,
  FormControlLabel,
  Switch,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import ResultsRow from '../CourseSummary/ResultsRow'
import VerticalHeading from '../CourseSummary/VerticalHeading'
import CourseUnitSummary from '../CourseSummary/CourseUnitSummary'
import DividerRow from '../CourseSummary/DividerRow'

import { getLanguageValue } from '../../util/languageUtils'
import useOrganisationSummary from '../../hooks/useOrganisationSummary'

import { useHistoryState } from '../CourseSummary/utils'

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

// A lot taken from OrganisationSummary.js
const ProgrammeTable = ({
  organisations,
  questions,
  handleIncludeOpenUniCourseUnitsChange,
  includeOpenUniCourseUnits,
}) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <TableContainer>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeOpenUniCourseUnits}
                    onChange={(event) => {
                      handleIncludeOpenUniCourseUnitsChange(
                        event.target.checked,
                      )
                    }}
                    color="primary"
                  />
                }
                label={t('courseSummary:includeOpenUniCourses')}
              />
            </th>
            <th aria-hidden="true" />
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
            <th aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
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

  const [includeOpenUniCourseUnits, setIncludeOpenUniCourseUnits] =
    useHistoryState('includeOpenUniCourseUnits', false)

  const { data, isLoading } = useOrganisationSummary(code, {
    includeOpenUniCourseUnits,
  })

  const handleIncludeOpenUniCourseUnitsChange = (
    nextIncludeOpenUniCourseUnits,
  ) => {
    setIncludeOpenUniCourseUnits(nextIncludeOpenUniCourseUnits)
    queryClient.invalidateQueries('organisationSummary')
  }

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  const { organisations, summaryQuestions } = data

  return (
    <>
      <ProgrammeTable
        organisations={organisations}
        questions={summaryQuestions}
        handleIncludeOpenUniCourseUnitsChange={
          handleIncludeOpenUniCourseUnitsChange
        }
        includeOpenUniCourseUnits={includeOpenUniCourseUnits}
      />
    </>
  )
}

export default ProgrammeSummary
