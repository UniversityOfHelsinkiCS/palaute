/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react'
/** @jsxImportSource @emotion/react */

import {
  Box,
  Typography,
  TableContainer,
  IconButton,
  Tooltip,
  LinearProgress,
  ToggleButton,
} from '@mui/material'
import {
  Check,
  Search,
  SettingsOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'

import { getAccess } from './utils'
import ColumnHeadings from './ColumnHeadings'
import { OrganisationLabel } from './Labels'
import useLocalStorageState from '../../hooks/useLocalStorageState'

const styles = {
  filtersCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: '0 1rem 1rem 1rem',
  },
  progressCell: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: '12px',
  },
  settingsButton: {
    '&:hover': {
      color: (theme) => theme.palette.primary.light,
      background: 'transparent',
    },
  },
}

const OrganisationButton = ({ code, access }) => {
  const { t } = useTranslation()
  if (!access) return null
  const { write } = access

  return (
    <Tooltip
      title={t(
        write
          ? 'courseSummary:programmeSettings'
          : 'courseSummary:programmeSummary',
      )}
      placement="top"
    >
      <IconButton
        id={`settings-button-${code}`}
        component={Link}
        to={`/organisations/${code}/${write ? 'settings' : 'summary'}`}
        size="large"
        sx={styles.settingsButton}
        color="primary"
        disableFocusRipple
      >
        {write ? (
          <SettingsOutlined sx={{ fontSize: '26px' }} />
        ) : (
          <Search sx={{ fontSize: '24px' }} />
        )}
      </IconButton>
    </Tooltip>
  )
}

const ToggleHiddenButton = ({ isHidden, toggle }) => {
  const { t } = useTranslation()
  return (
    <Tooltip
      placement="right"
      title={t(isHidden ? 'common:show' : 'common:hide')}
    >
      <IconButton
        onClick={toggle}
        sx={styles.settingsButton}
        disableFocusRipple
        color={isHidden ? 'info' : 'default'}
      >
        {isHidden ? (
          <VisibilityOff fontSize="small" />
        ) : (
          <Visibility fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  )
}

const HidingModeButton = ({ isHidingMode, setIsHidingMode, count }) => {
  const { t } = useTranslation()
  return (
    <Box mt="12rem" display="flex" alignItems="center">
      <Tooltip
        title={t('courseSummary:showHiddenOrganisations', { count })}
        placement="top"
      >
        <ToggleButton
          selected={isHidingMode}
          onChange={() => setIsHidingMode(!isHidingMode)}
          color="primary"
        >
          {isHidingMode ? <Check /> : <Visibility />}
        </ToggleButton>
      </Tooltip>
      <Box mr="1.5rem" />
      {isHidingMode && (
        <Typography
          variant="subtitle1"
          color="textSecondary"
          textAlign="left"
          lineHeight="1.5"
        >
          {t('courseSummary:hidingInfo')}
        </Typography>
      )}
    </Box>
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
  isHidingMode,
  setIsHidingMode,
  loading = false,
  organisationLinks = false,
}) => {
  const { t, i18n } = useTranslation()
  const [hiddenRows, setHiddenRows] = useLocalStorageState('hidden-rows')
  const showHidingModeButton =
    organisationAccess?.length > 0 && organisations.length > 1

  const isHidden = (code) => {
    if (!Array.isArray(hiddenRows)) {
      return false
    }
    return hiddenRows.includes(code)
  }

  const toggleRowHidden = (value) => {
    if (!Array.isArray(hiddenRows)) {
      setHiddenRows([value])
      return
    }

    if (hiddenRows.includes(value)) {
      setHiddenRows(hiddenRows.filter((r) => r !== value))
    } else {
      setHiddenRows(hiddenRows.concat(value))
    }
  }

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
            <th />
            {showHidingModeButton && (
              <th>
                <HidingModeButton
                  isHidingMode={isHidingMode}
                  setIsHidingMode={setIsHidingMode}
                  count={hiddenRows?.length}
                />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={99} css={styles.progressCell}>
                <LinearProgress />
              </td>
            </tr>
          )}

          {!loading &&
            organisations
              .filter((org) => isHidingMode || !hiddenRows?.includes(org.code))
              .map(
                ({
                  code,
                  id,
                  name,
                  results,
                  feedbackCount,
                  courseUnits,
                  studentCount,
                  feedbackResponsePercentage,
                }) => (
                  <React.Fragment key={id}>
                    <ResultsRow
                      id={id}
                      label={
                        <OrganisationLabel
                          name={getLanguageValue(name, i18n.language)}
                          code={code}
                        />
                      }
                      results={results}
                      questions={questions}
                      feedbackCount={feedbackCount}
                      studentCount={studentCount}
                      feedbackResponsePercentage={feedbackResponsePercentage}
                      accordionEnabled={courseUnits.length > 0}
                      accordionInitialOpen={initialOpenAccordions.includes(id)}
                      onToggleAccordion={() => onToggleAccordion(id)}
                      cellsAfter={
                        <>
                          {organisationLinks && (
                            <td css={{ paddingLeft: '2rem' }}>
                              <OrganisationButton
                                code={code}
                                access={getAccess(id, organisationAccess)}
                              />
                            </td>
                          )}
                          {isHidingMode && (
                            <td>
                              <ToggleHiddenButton
                                isHidden={isHidden(code)}
                                toggle={() => toggleRowHidden(code)}
                              />
                            </td>
                          )}
                        </>
                      }
                    >
                      <CourseUnitSummary
                        courseUnits={courseUnits}
                        questions={questions}
                      />
                    </ResultsRow>
                    <DividerRow height={1.3} />
                  </React.Fragment>
                ),
              )}
        </tbody>
      </table>
    </TableContainer>
  )
}

export default OrganisationTable
