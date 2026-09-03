import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableBody,
  CircularProgress,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useIsFetching } from '@tanstack/react-query'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useUserOrganisationAccessByCode } from '../../../hooks/useUserOrganisationAccess'
import { focusIndicatorStyle } from '../../../util/accessibility'
import { UNIVERSITY_ROOT_ID } from '../../../util/common'
import { TAGS_ENABLED } from '../../../util/common'
import { getLanguageValue } from '../../../util/languageUtils'
import { useSummaryContext } from '../context'
import { useSummary, useChildOrganisations, useTags, useOrderedCourseUnits } from '../utils'
import { QuestionFullLabels } from './Labels'
import NoSummaryAlert from './NoSummaryAlert'
import { PinButton, getOrganisationTableButtonId } from './OrganisationRow'
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
  actionButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '3.5rem',
    width: '3.5rem',
    borderRadius: 5,
    color: 'white',
    backgroundColor: 'primary.main',
    scrollMarginTop: 'calc(var(--sticky-header-height, 0px) + 8px)',
    scrollMarginLeft: 'calc(var(--sticky-column-width, 0px) + 8px)',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle(),
  },
}

export const NoActions = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: 2,
      backgroundColor: 'transparent',
    }}
  >
    <Typography>–</Typography>
  </Box>
)

export const ExpandRowButton = ({
  expanded,
  handleExpand,
  targetName,
  t,
  showLabel = 'courseSummary:showBreakdown',
  hideLabel = 'courseSummary:hideBreakdown',
}) => (
  <Tooltip title={`${expanded ? t(hideLabel) : t(showLabel)}, ${targetName}`} arrow placement="bottom">
    <IconButton
      sx={styles.actionButton}
      onClick={handleExpand}
      disableFocusRipple
      aria-expanded={expanded}
      aria-label={`${expanded ? t(hideLabel) : t(showLabel)}, ${targetName}`}
    >
      {expanded ? (
        <ExpandLessIcon aria-hidden="true" sx={{ fontSize: '30px' }} />
      ) : (
        <ExpandMoreIcon aria-hidden="true" sx={{ fontSize: '30px' }} />
      )}
    </IconButton>
  </Tooltip>
)

const OrganisationSettingsButton = ({ code, t }) => {
  const access = useUserOrganisationAccessByCode(code)

  if (!access?.write) return null

  return (
    <Tooltip title={`${t('courseSummary:organisationSettings')}, ${code}`} arrow placement="bottom">
      <IconButton
        component={Link}
        to={`/organisations/${code}/settings`}
        sx={styles.actionButton}
        disableFocusRipple
        aria-label={`${t('courseSummary:organisationSettings')}, ${code}`}
      >
        {<SettingsIcon aria-hidden="true" />}
      </IconButton>
    </Tooltip>
  )
}

const Actions = ({ targetName, organisation, rowExpanded, handleExpand, showPin = true, t }) => {
  if (!targetName) {
    return <NoActions />
  }

  return (
    <Stack direction="row" spacing={1}>
      {handleExpand && (
        <ExpandRowButton expanded={rowExpanded} handleExpand={handleExpand} targetName={targetName} t={t} />
      )}
      {organisation && showPin && <PinButton organisation={organisation} tableView />}
      {organisation && <OrganisationSettingsButton code={organisation.code} t={t} />}
    </Stack>
  )
}

const TagRow = ({ tag, organisation, questions, depth, dateRange }) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const { courseUnits, isLoading: courseUnitsLoading } = useOrderedCourseUnits({ organisation, tagId: tag.id })

  const openable = courseUnits.length > 0

  return (
    <>
      <SummaryTableRow
        target={`${t('courseSummary:tagLabel')}: ${getLanguageValue(tag.name, i18n.language)}`}
        summary={tag.summary}
        dateRange={dateRange}
        questions={questions}
        depth={depth}
        open={openable ? open : undefined}
        handleOpen={openable ? () => setOpen(!open) : undefined}
        actions={
          courseUnits?.length === 0 ? (
            <NoActions />
          ) : (
            <Actions
              targetName={getLanguageValue(tag.name, i18n.language)}
              rowExpanded={open}
              handleExpand={() => setOpen(!open)}
              t={t}
            />
          )
        }
      />
      {open &&
        courseUnits.map(cu => {
          const targetName = `${cu.courseCode} ${getLanguageValue(cu.name, i18n.language)}`
          return (
            <SummaryTableRow
              key={cu.id}
              target={
                courseUnitsLoading ? t('courseSummary:loading') : `${t('courseSummary:courseUnit')}: ${targetName}`
              }
              targetCode={cu.courseCode}
              summary={courseUnitsLoading ? undefined : cu.summary}
              dateRange={dateRange}
              questions={questions}
              depth={depth + 1}
              isCourseUnit
              actions={<NoActions />}
            />
          )
        })}
    </>
  )
}

const OrganisationRow = ({
  organisation,
  questions,
  depth,
  initiallyOpen = false,
  orgsOnly = false,
  courseUnitsOnly = false,
  showRootPin = true,
  noPins = false,
  dateRange,
}) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(initiallyOpen)

  const { summary, isLoading: summaryLoading } = useSummary(organisation)
  const { childOrganisations, isLoading: childOrganisationsLoading } = useChildOrganisations(organisation, {
    enabled: !courseUnitsOnly,
  })
  const tagsEnabled = !courseUnitsOnly && TAGS_ENABLED.includes(organisation?.code)
  const { tags, isLoading: tagsLoading } = useTags({
    organisation,
    tagsEnabled,
  })
  // Course units under a tag are listed in the tag rows, don't duplicate them here
  const { courseUnits, isLoading: courseUnitsLoading } = useOrderedCourseUnits({
    organisation,
    excludeTagged: tagsEnabled,
  })

  if (summaryLoading || childOrganisationsLoading || tagsLoading || courseUnitsLoading)
    return <SummaryTableRow target={t('courseSummary:loading')} questions={questions} depth={depth} />

  const openable = childOrganisations.length > 0 || (!orgsOnly && (tags.length > 0 || courseUnits.length > 0))

  return (
    <>
      <SummaryTableRow
        target={`${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`}
        targetCode={!noPins ? organisation?.code : undefined}
        summary={summary}
        dateRange={dateRange}
        questions={questions}
        depth={depth}
        actions={
          <Actions
            targetName={organisation?.code}
            organisation={organisation}
            rowExpanded={openable ? open : undefined}
            handleExpand={openable ? () => setOpen(!open) : undefined}
            showPin={showRootPin && !noPins}
            t={t}
          />
        }
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
              orgsOnly={orgsOnly}
              courseUnitsOnly={courseUnitsOnly}
              noPins={noPins}
            />
          ))}
          {!orgsOnly &&
            tags.map(tag => (
              <TagRow
                key={tag.id}
                tag={tag}
                organisation={organisation}
                questions={questions}
                depth={depth + 1}
                dateRange={dateRange}
              />
            ))}
          {!orgsOnly &&
            courseUnits.map(cu => {
              const targetName = `${cu.courseCode} ${getLanguageValue(cu.name, i18n.language)}`
              return (
                <SummaryTableRow
                  key={cu.id}
                  target={`${t('courseSummary:courseUnit')}: ${targetName}`}
                  targetCode={cu.courseCode}
                  summary={cu.summary}
                  dateRange={dateRange}
                  questions={questions}
                  depth={depth + 1}
                  isCourseUnit
                  actions={<NoActions />}
                />
              )
            })}
        </>
      )}
    </>
  )
}

export const OrganisationTable = ({
  organisation,
  questions,
  dateRange,
  firstRowOpen = true,
  orgsOnly = false,
  courseUnitsOnly = false,
  showRootPin = true,
  noPins = false,
}) => {
  const { t, i18n } = useTranslation()
  const [depth, setDepth] = useState('orgs') // 'hide', 'orgs', 'cu'
  const [isScrollable, setIsScrollable] = useState(false)
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0)
  const [stickyColumnWidth, setStickyColumnWidth] = useState(0)
  const tableContainerRef = useRef(null)

  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', organisation?.id],
  })

  const organisationTitle = `${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`
  const captionId = `caption-${organisation?.code}`

  // The table container should have tabIndex=0 when it is scrollable, so that keyboard user can focus it and scroll.
  // However, when the table is not scrollable, focusing table container would be useless and just an extra stop.
  // When the content of the table changes, it is checked if the table is scrollable or not to set the tabIndex correctly.
  useLayoutEffect(() => {
    const container = tableContainerRef.current

    if (!container) return undefined

    const checkScrollable = () =>
      setIsScrollable(
        container.scrollHeight - container.clientHeight > 1 || container.scrollWidth - container.clientWidth > 1
      )

    checkScrollable()

    const resizeObserver = new ResizeObserver(checkScrollable)
    resizeObserver.observe(container)

    const headerRow = container.querySelector('thead tr')
    const headerResizeObserver = new ResizeObserver(([entry]) => setStickyHeaderHeight(entry.target.offsetHeight))
    if (headerRow) headerResizeObserver.observe(headerRow)

    const stickyColumnCell = container.querySelector('th[scope="row"]')
    const stickyColumnResizeObserver = new ResizeObserver(([entry]) => setStickyColumnWidth(entry.target.offsetWidth))
    if (stickyColumnCell) stickyColumnResizeObserver.observe(stickyColumnCell)

    return () => {
      resizeObserver.disconnect()
      headerResizeObserver.disconnect()
      stickyColumnResizeObserver.disconnect()
    }
  }, [depth, isFetching])

  // Sticky header/column don't clip the scrollport, so the browser's native
  // scroll-into-view-on-focus doesn't know they visually obscure content
  // underneath them. Nudge the scroll position manually when that happens.
  const handleFocusWithinTable = event => {
    const container = tableContainerRef.current
    const target = event.target

    if (!container || !target || target === container) return

    const buffer = 8
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    const topObstruction = containerRect.top + stickyHeaderHeight
    if (targetRect.top < topObstruction) {
      container.scrollTop = Math.max(0, container.scrollTop - (topObstruction - targetRect.top + buffer))
    }

    const leftObstruction = containerRect.left + stickyColumnWidth
    if (targetRect.left < leftObstruction) {
      container.scrollLeft = Math.max(0, container.scrollLeft - (leftObstruction - targetRect.left + buffer))
    }
  }

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
            aria-expanded={depth !== 'hide'}
            disableFocusRipple
          >
            {organisationTitle}
          </Button>
        </Box>
      </Box>
      {depth !== 'hide' && Boolean(isFetching) && (
        <Box sx={styles.loadingContainer}>
          {/* oxlint-disable-next-line jsx-a11y/aria-role */}
          <CircularProgress size="2rem" variant="indeterminate" role={undefined} aria-hidden="true" />
          <Typography>{t('courseSummary:loading')}</Typography>
        </Box>
      )}
      {depth !== 'hide' && !isFetching && (
        <Box sx={{ p: 1, border: '1px solid gray' }}>
          <TableContainer
            ref={tableContainerRef}
            onFocus={handleFocusWithinTable}
            style={{
              '--sticky-header-height': `${stickyHeaderHeight}px`,
              '--sticky-column-width': `${stickyColumnWidth}px`,
            }}
            sx={{
              maxHeight: Math.floor(window.innerHeight * 0.8),
              overflow: 'auto',
              '&:focus-visible': {
                outline: '3px solid',
                outlineColor: 'primary.main',
                outlineOffset: '3px',
              },
            }}
            {...(isScrollable ? { tabIndex: 0, 'aria-labelledby': captionId } : {})}
          >
            <Table stickyHeader>
              <caption id={captionId} style={styles.caption}>
                {`${t('organisationSettings:summaryTab')}: ${organisationTitle}`}
              </caption>
              <SummaryTableHeader questions={questions} />
              <TableBody>
                <OrganisationRow
                  key={organisation?.id}
                  organisation={organisation}
                  questions={questions}
                  depth={1}
                  initiallyOpen={firstRowOpen}
                  dateRange={dateRange}
                  orgsOnly={orgsOnly}
                  courseUnitsOnly={courseUnitsOnly}
                  showRootPin={showRootPin}
                  noPins={noPins}
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

  const unpinnedOrgsWithoutUniversity = otherOrgs.filter(org => org.id !== UNIVERSITY_ROOT_ID)

  const justOneOrg = unpinnedOrgsWithoutUniversity.length === 1

  const noSummary = pinnedOrgs?.length + otherOrgs?.length === 0

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <SummaryRowFilters hideColumns showSortSelector={!noSummary} />
      </Box>
      {noSummary && <NoSummaryAlert alertText={t('courseSummary:noSummaryInfo')} />}
      {!noSummary && <QuestionFullLabels questions={questions} />}
      {university && (
        <OrganisationTable
          organisation={university}
          questions={questions}
          dateRange={dateRange}
          orgsOnly={true}
          showRootPin={false}
        />
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
              firstRowOpen={false}
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
              firstRowOpen={justOneOrg && pinnedOrgs.length === 0}
              showRootPin={!justOneOrg}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default OrganisationSummaryTableView
