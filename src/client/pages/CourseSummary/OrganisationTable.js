/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { forwardRef } from 'react'
/** @jsxImportSource @emotion/react */

import { TableContainer, IconButton, Tooltip, LinearProgress } from '@mui/material'
import { Search, SettingsOutlined } from '@mui/icons-material'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import CourseUnitSummary from './CourseUnitSummary'

import ColumnHeadings from './ColumnHeadings'
import { OrganisationLabel } from './Labels'
import HiddenRows from './HiddenRows'
import CensoredCount from './CensoredCount'

const styles = {
  table: {
    borderSpacing: '2px 0.8rem',
  },
  filtersCell: {
    verticalAlign: 'bottom',
  },
  progressCell: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: '12px',
  },
  settingsButton: {
    '&:hover': {
      color: theme => theme.palette.primary.light,
      background: 'transparent',
    },
  },
}

const OrganisationButton = ({ code, access }) => {
  const { t } = useTranslation()
  if (!access) return null
  const { write } = access

  return (
    <Tooltip title={t(write ? 'courseSummary:programmeSettings' : 'courseSummary:programmeSummary')} placement="top">
      <IconButton
        id={`settings-button-${code}`}
        component={Link}
        to={`/organisations/${code}/${write ? 'settings' : 'summary'}`}
        size="large"
        sx={styles.settingsButton}
        color="primary"
        disableFocusRipple
      >
        {write ? <SettingsOutlined sx={{ fontSize: '26px' }} /> : <Search sx={{ fontSize: '24px' }} />}
      </IconButton>
    </Tooltip>
  )
}

const OrganisationTable = forwardRef(
  (
    {
      average,
      organisations,
      isOrganisationsLoading,
      questions,
      organisationAccess,
      initialOpenAccordions = [],
      onToggleAccordion = () => {},
      onOrderByChange,
      filters,
      isRefetching = false,
      organisationLinks = false,
    },
    ref
  ) => {
    const { i18n } = useTranslation()

    const showHidingModeButton = organisationAccess?.length > 1 && organisations.length > 1

    return (
      <TableContainer sx={{ overflow: 'visible' }} ref={ref}>
        <table css={styles.table}>
          <thead>
            <tr>
              <th css={styles.filtersCell}>{filters}</th>
              <ColumnHeadings onOrderByChange={onOrderByChange} questions={questions} />
              <th />
              {showHidingModeButton && (
                <th>
                  <HiddenRows />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {(isOrganisationsLoading || isRefetching) && (
              <tr>
                <td colSpan={99}>
                  <LinearProgress />
                </td>
              </tr>
            )}

            {!(isOrganisationsLoading || isRefetching) && (
              <>
                {average && (
                  <ResultsRow
                    label={getLanguageValue(average.name, i18n.language)}
                    results={average.results}
                    questions={questions}
                    feedbackCount={average.feedbackCount}
                    studentCount={average.studentCount}
                    feedbackResponsePercentage={average.feedbackResponsePercentage}
                  />
                )}
                {organisations.map(
                  ({
                    code,
                    id,
                    name,
                    results,
                    feedbackCount,
                    courseUnits,
                    studentCount,
                    hiddenCount,
                    feedbackResponsePercentage,
                    access,
                  }) => (
                    <React.Fragment key={id}>
                      <ResultsRow
                        label={<OrganisationLabel name={getLanguageValue(name, i18n.language)} code={code} />}
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
                            <>
                              <td css={{ paddingLeft: '2rem' }}>
                                <OrganisationButton code={code} access={access} />
                              </td>
                              {access?.admin && !!hiddenCount && (
                                <td>
                                  <CensoredCount count={hiddenCount} />
                                </td>
                              )}
                            </>
                          )
                        }
                      >
                        <CourseUnitSummary courseUnits={courseUnits} questions={questions} access={access} />
                      </ResultsRow>
                    </React.Fragment>
                  )
                )}
              </>
            )}
          </tbody>
        </table>
      </TableContainer>
    )
  }
)

export default OrganisationTable
