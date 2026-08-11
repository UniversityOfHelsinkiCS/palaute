import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Typography, TableContainer, Table, TableBody, CircularProgress, Button } from '@mui/material'
import { useIsFetching } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserOrganisationAccessByCode } from '../../../hooks/useUserOrganisationAccess'
import { focusIndicatorStyle } from '../../../util/accessibility'
import { UNIVERSITY_ROOT_ID } from '../../../util/common'
import { TAGS_ENABLED } from '../../../util/common'
import { getLanguageValue } from '../../../util/languageUtils'
import { useSummaryContext } from '../context'
import { useSummary, useChildOrganisations, useTags, useOrderedCourseUnits } from '../utils'
import { OrganisationLink } from './OrganisationLink'
import { PinButton } from './OrganisationRow'
import SummaryRowFilters from './SummaryRowFilters'
import { SummaryTableHeader, SummaryTableRow } from './SummaryTableRow'

const styles = {
  titleContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white',
    backgroundColor: 'primary.main',
    p: 2,
    rowGap: 2,
  },
  caption: {
    captionSide: 'bottom',
    textAlign: 'left',
    fontSize: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    py: 4,
    border: '1px solid gray',
  },
  cuButton: {
    color: 'white',
    borderColor: 'white',
    py: 1,
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
  expandButton: {
    typography: 'h6',
    color: 'white',
    backgroundColor: 'transparent',
    borderRadius: 2,
    px: 1.5,
    scrollMarginTop: '8rem',
    textTransform: 'none',
    '& .MuiButton-startIcon svg': {
      fontSize: 32,
    },
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
}

const getOrganisationTableButtonId = organisationId => `organisation-table-button-${organisationId}`

const UniversityTable = ({ organisation, childOrganisations, questions }) => {
  const { t, i18n } = useTranslation()
  const [depth, setDepth] = useState('all') // 'hide', 'uni', 'all'

  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', organisation?.id],
  })

  const { courseUnits } = useOrderedCourseUnits({ organisation })

  const organisationTitle = `${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`

  const access = useUserOrganisationAccessByCode(organisation?.code)
  const linkComponent = <OrganisationLink code={organisation?.code} access={access} tableView />

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={styles.titleContainer}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            type="button"
            onClick={() => (depth === 'hide' ? setDepth('all') : setDepth('hide'))}
            startIcon={depth === 'hide' ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            sx={styles.expandButton}
            aria-label={
              depth === 'hide'
                ? `${organisationTitle}: ${t('courseSummary:showSummary')}`
                : `${organisationTitle}: ${t('courseSummary:hideSummary')}`
            }
            disableRipple
          >
            {organisationTitle}
          </Button>
          {linkComponent}
        </Box>
      </Box>
      {depth !== 'hide' && Boolean(isFetching) && (
        <Box sx={styles.loadingContainer}>
          {/* oxlint-disable-next-line jsx-a11y/aria-role */}
          <CircularProgress size="2rem" variant="indeterminate" role={undefined} aria-hidden />
          <Typography>{t('courseSummary:loading')}</Typography>
        </Box>
      )}
      {depth !== 'hide' && !isFetching && (
        <Box sx={{ p: 1, border: '1px solid gray' }}>
          <TableContainer sx={{ maxHeight: Math.floor(window.innerHeight * 0.8), overflow: 'auto' }}>
            <Table stickyHeader>
              <caption style={styles.caption}>
                {`${t('organisationSettings:summaryTab')}: ${organisationTitle}`}
              </caption>
              <SummaryTableHeader questions={questions} extraCols={[t('common:actions')]} />
              <TableBody>
                <SummaryTableRow
                  target={`${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`}
                  summary={organisation?.summary}
                  questions={questions}
                  open={depth === 'all'}
                  handleOpen={() => (depth === 'all' ? setDepth('uni') : setDepth('all'))}
                  extraCells={[<Typography key="no-actions">–</Typography>]}
                />
                {depth === 'all' &&
                  childOrganisations.map(org => (
                    <SummaryTableRow
                      key={org.id}
                      target={`${org.code} ${getLanguageValue(org.name, i18n.language)}`}
                      summary={org.summary}
                      questions={questions}
                      depth={2}
                      targetComponentId={getOrganisationTableButtonId(org.id)}
                      extraCells={[<PinButton key="actions" organisation={org} />]}
                    />
                  ))}
                {depth === 'all' &&
                  courseUnits.map(cu => (
                    <SummaryTableRow
                      key={cu.id}
                      target={`${t('courseSummary:courseUnit')}: ${cu.courseCode} ${getLanguageValue(cu.name, i18n.language)}`}
                      targetCode={cu.courseCode}
                      summary={cu.summary}
                      questions={questions}
                      depth={2}
                      extraCells={[<Typography key="no-actions">–</Typography>]}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

const TagRow = ({ tag, organisation, questions, depth, dateRange, showActions }) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const { courseUnits, isLoading: courseUnitsLoading } = useOrderedCourseUnits({ organisation, tagId: tag.id })

  const openable = courseUnits.length > 0

  return (
    <>
      <SummaryTableRow
        target={`${t('courseSummary:tagLabel')}: ${getLanguageValue(tag.name, i18n.language)}`}
        summary={tag.summary}
        questions={questions}
        depth={depth}
        open={openable ? open : undefined}
        handleOpen={openable ? () => setOpen(!open) : undefined}
        indent={!openable}
        extraCells={showActions ? [<Typography key="no-actions">–</Typography>] : undefined}
      />
      {open &&
        courseUnits.map(cu => (
          <SummaryTableRow
            key={cu.id}
            target={
              courseUnitsLoading
                ? t('courseSummary:loading')
                : `${t('courseSummary:courseUnit')}: ${cu.courseCode} ${getLanguageValue(cu.name, i18n.language)}`
            }
            targetCode={courseUnitsLoading ? undefined : cu.courseCode}
            summary={courseUnitsLoading ? undefined : cu.summary}
            questions={questions}
            depth={depth + 1}
            dateRange={dateRange}
            extraCells={showActions ? [<Typography key="no-actions">–</Typography>] : undefined}
          />
        ))}
    </>
  )
}

const OrganisationRow = ({ organisation, questions, depth, initiallyOpen = false, showActions = false, dateRange }) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(initiallyOpen)

  const { summary, isLoading: summaryLoading } = useSummary(organisation)
  const { childOrganisations, isLoading: childOrganisationsLoading } = useChildOrganisations(organisation)
  const { tags, isLoading: tagsLoading } = useTags({
    organisation,
    tagsEnabled: TAGS_ENABLED.includes(organisation?.code),
  })
  const { courseUnits, isLoading: courseUnitsLoading } = useOrderedCourseUnits({ organisation })

  if (summaryLoading || childOrganisationsLoading || tagsLoading || courseUnitsLoading)
    return <SummaryTableRow target={t('courseSummary:loading')} questions={questions} depth={depth} />

  const openable = childOrganisations.length > 0 || tags.length > 0 || courseUnits.length > 0

  return (
    <>
      <SummaryTableRow
        target={`${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`}
        summary={summary}
        questions={questions}
        depth={depth}
        open={openable ? open : undefined}
        handleOpen={openable ? () => setOpen(!open) : undefined}
        indent={!openable}
        extraCells={showActions ? [<PinButton key="actions" organisation={organisation} />] : undefined}
      />
      {open && (
        <>
          {childOrganisations.map(org => (
            <OrganisationRow
              key={org.id}
              organisation={org}
              questions={questions}
              depth={depth + 1}
              dateRange={dateRange}
              showActions={showActions}
            />
          ))}
          {tags.map(tag => (
            <TagRow
              key={tag.id}
              tag={tag}
              organisation={organisation}
              questions={questions}
              depth={depth + 1}
              dateRange={dateRange}
              showActions={showActions}
            />
          ))}
          {courseUnits.map(cu => (
            <SummaryTableRow
              key={cu.id}
              target={`${t('courseSummary:courseUnit')}: ${cu.courseCode} ${getLanguageValue(cu.name, i18n.language)}`}
              targetCode={cu.courseCode}
              summary={cu.summary}
              questions={questions}
              depth={depth + 1}
              dateRange={dateRange}
              extraCells={showActions ? [<Typography key="no-actions">–</Typography>] : undefined}
            />
          ))}
        </>
      )}
    </>
  )
}

export const OrganisationTable = ({ organisation, questions, dateRange, firstRowOpen = true, showActions = true }) => {
  const { t, i18n } = useTranslation()
  const [depth, setDepth] = useState('orgs') // 'hide', 'orgs', 'cu'

  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', organisation?.id],
  })

  const organisationTitle = `${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`

  const access = useUserOrganisationAccessByCode(organisation?.code)
  const linkComponent = <OrganisationLink code={organisation?.code} access={access} tableView />

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={styles.titleContainer}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            id={getOrganisationTableButtonId(organisation?.id)}
            type="button"
            onClick={() => (depth === 'hide' ? setDepth('orgs') : setDepth('hide'))}
            startIcon={depth === 'hide' ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            sx={styles.expandButton}
            aria-label={
              depth === 'hide'
                ? `${organisationTitle}: ${t('courseSummary:showSummary')}`
                : `${organisationTitle}: ${t('courseSummary:hideSummary')}`
            }
            disableRipple
          >
            {organisationTitle}
          </Button>
          {linkComponent}
        </Box>
      </Box>
      {depth !== 'hide' && Boolean(isFetching) && (
        <Box sx={styles.loadingContainer}>
          {/* oxlint-disable-next-line jsx-a11y/aria-role */}
          <CircularProgress size="2rem" variant="indeterminate" role={undefined} aria-hidden />
          <Typography>{t('courseSummary:loading')}</Typography>
        </Box>
      )}
      {depth !== 'hide' && !isFetching && (
        <Box sx={{ p: 1, border: '1px solid gray' }}>
          <TableContainer sx={{ maxHeight: Math.floor(window.innerHeight * 0.8), overflow: 'auto' }}>
            <Table stickyHeader>
              <caption style={styles.caption}>
                {`${t('organisationSettings:summaryTab')}: ${organisationTitle}`}
              </caption>
              <SummaryTableHeader questions={questions} extraCols={showActions ? [t('common:actions')] : undefined} />
              <TableBody>
                <OrganisationRow
                  key={organisation?.id}
                  organisation={organisation}
                  questions={questions}
                  depth={1}
                  initiallyOpen={firstRowOpen}
                  dateRange={dateRange}
                  showActions={showActions}
                />
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

const OrganisationSummaryTableView = ({ pinnedOrgs, otherOrgs }) => {
  const { t } = useTranslation()
  const { questions, dateRange } = useSummaryContext()

  const university = otherOrgs.find(org => org.id === UNIVERSITY_ROOT_ID)
  const { childOrganisations: universityChildOrgs } = useChildOrganisations(university)

  const unpinnedOrgsWithoutUniversity =
    university && universityChildOrgs
      ? universityChildOrgs.filter(org => !pinnedOrgs.some(p => p.id === org.id))
      : otherOrgs.filter(org => org.id !== UNIVERSITY_ROOT_ID)

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <SummaryRowFilters hideColumns />
      {university && (
        <UniversityTable organisation={university} childOrganisations={universityChildOrgs} questions={questions} />
      )}
      {pinnedOrgs.length > 0 && (
        <Box>
          <Typography component="h2" variant="h6" sx={{ my: 2 }}>
            {t('courseSummary:pinnedOrganisationsLong', { count: pinnedOrgs.length })}
          </Typography>
          {pinnedOrgs.map(org => (
            <OrganisationTable
              key={org.id}
              organisation={org}
              questions={questions}
              dateRange={dateRange}
              firstRowOpen={true}
            />
          ))}
        </Box>
      )}
      {unpinnedOrgsWithoutUniversity.length > 0 && (
        <Box>
          {pinnedOrgs.length > 0 && (
            <Typography component="h2" variant="h6" sx={{ my: 2 }}>
              {t('courseSummary:otherOrganisations', { count: unpinnedOrgsWithoutUniversity.length })}
            </Typography>
          )}
          {unpinnedOrgsWithoutUniversity.map(org => (
            <OrganisationTable
              key={org.id}
              organisation={org}
              questions={questions}
              dateRange={dateRange}
              firstRowOpen={false}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default OrganisationSummaryTableView
