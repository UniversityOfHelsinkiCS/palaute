import React from 'react'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { Box, ButtonBase, Typography, Tooltip, Skeleton } from '@mui/material'
import { useSummaries } from './api'
import { getLanguageValue } from '../../util/languageUtils'
import SummaryResultItem from '../../components/SummaryResultItem/SummaryResultItem'
import { CourseUnitLabel, OrganisationLabel, TagLabel } from './Labels'
import PercentageCell from './PercentageCell'
import useRandomColor from '../../hooks/useRandomColor'
import { useOrderedAndFilteredOrganisations } from './utils'
import { useSummaryContext } from './context'
import Sort from './Sort'
import { OrganisationLink } from './OrganisationLink'
import { useUserOrganisationAccessByCode } from '../../hooks/useUserOrganisationAccess'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import { TAGS_ENABLED } from '../../util/common'

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
    aspectRatio: 1, // Make them square
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    flexShrink: 0,
    width: '7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentCell: {
    whiteSpace: 'nowrap',
    textAlign: 'right',
    width: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  accordionButton: {
    width: '22rem',
    flexShrink: 0,
    minHeight: '48px',
    maxHeight: '74px',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
    '&:hover': {
      background: theme => theme.palette.action.hover,
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    transition: 'background-color 0.15s ease-out',
  },
  unclickableLabel: {
    width: '22rem',
    flexShrink: 0,
    minHeight: '48px',
    maxHeight: '74px',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
  },
  link: {
    color: theme => theme.palette.primary.main,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: '0.7rem',
    '&:hover': {
      color: theme => theme.palette.text.primary,
    },
    color: theme => theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
  given: {
    color: theme => theme.palette.success.main,
    '&:hover': {
      color: theme => theme.palette.success.light,
    },
  },
  notGiven: {
    color: theme => theme.palette.error.main,
    '&:hover': {
      color: theme => theme.palette.error.light,
    },
  },
  feedbackOpen: {
    color: theme => theme.palette.primary.main,
    '&:hover': {
      color: theme => theme.palette.primary.light,
    },
  },
}

const Loader = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="stretch"
    gap="0.4rem"
    sx={{ transition: 'padding-top 0.2s ease-out' }}
  >
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader
        label={
          <Skeleton>
            <Typography>Ladataan</Typography>
          </Skeleton>
        }
      />
    </Box>
  </Box>
)

const RowHeader = ({ openable = false, isOpen = false, handleOpenRow, label, link }) => (
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>
    {openable ? (
      <ButtonBase onClick={handleOpenRow} sx={styles.accordionButton} variant="contained" disableRipple>
        {label}
        <Box sx={styles.arrowContainer}>
          <ChevronRight sx={{ ...styles.arrow, ...(isOpen ? styles.arrowOpen : {}) }} />
        </Box>
      </ButtonBase>
    ) : (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {link ? (
          <ButtonBase
            to={link}
            component={RouterLink}
            sx={{ ...styles.accordionButton, ...styles.link }}
            variant="contained"
          >
            {label}
          </ButtonBase>
        ) : (
          <Box sx={styles.unclickableLabel}>{label}</Box>
        )}
      </>
    )}
  </>
)

const TagSummaryRow = ({ tag, questions, organisationId }) => {
  const [isTransitioning, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = React.useState(false)
  const [nextIsOpen, setNextIsOpen] = React.useState(isOpen)

  const indentLineColor = useRandomColor(tag?.code ?? '')

  const label = <TagLabel tag={tag} />

  const handleOpenRow = () => {
    setNextIsOpen(!isOpen)
    startTransition(() => setIsOpen(!isOpen))
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.4rem">
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader label={label} openable handleOpenRow={handleOpenRow} isOpen={nextIsOpen} />
        <OrganisationResults summary={tag.summary} questions={questions} />
      </Box>
      {(isTransitioning || isOpen) && (
        <Box
          sx={{ pl: '2rem', borderLeft: `solid 3px ${indentLineColor}`, pb: '0.5rem' }}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          gap="0.4rem"
        >
          {isOpen && <CourseUnitsList organisationId={organisationId} questions={questions} />}
        </Box>
      )}
    </Box>
  )
}

const CourseUnitSummaryRow = ({ courseUnit, questions }) => {
  const { i18n, t } = useTranslation()

  const labelExtras = []
  if (courseUnit.partial) labelExtras.push(t('common:partiallyResponsible'))
  if (courseUnit.separateOrganisation)
    labelExtras.push(getLanguageValue(courseUnit.separateOrganisation.name, i18n.language))

  const label = (
    <CourseUnitLabel
      name={getLanguageValue(courseUnit.name, i18n.language)}
      code={courseUnit.courseCode}
      extras={labelExtras}
    />
  )

  const link = `/course-summary/${courseUnit.courseCode}`
  const { summary } = courseUnit
  const percent = ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed()
  const feedbackResponsePercentage = (summary.data.feedbackResponsePercentage * 100).toFixed()

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={label} link={link} />
      {questions.map(q => (
        <SummaryResultItem
          key={q.id}
          question={q}
          mean={summary.data.result[q.id]?.mean}
          distribution={summary.data.result[q.id]?.distribution}
          sx={styles.resultCell}
          component="div"
        />
      ))}
      <Tooltip title={t('common:feedbacksGivenRatio')} disableInteractive>
        <Typography variant="body2" sx={styles.countCell}>
          {summary.data.feedbackCount} / {summary.data.studentCount}
        </Typography>
      </Tooltip>
      <PercentageCell
        label={`${percent}%`}
        percent={percent}
        sx={styles.percentCell}
        tooltip={`${t('courseSummary:feedbackPercentage')}: ${percent}%`}
      />
      <PercentageCell
        label={`${feedbackResponsePercentage}%`}
        percent={feedbackResponsePercentage}
        sx={styles.percentCell}
        tooltip={`${t('courseSummary:feedbackResponsePercentage')}: ${feedbackResponsePercentage}%`}
      />
    </Box>
  )
}

const ChildOrganisationsList = ({ organisationId, initialChildOrganisations }) => {
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    include: 'childOrganisations',
    enabled: !initialChildOrganisations?.length,
  })

  const childOrganisations = initialChildOrganisations ?? organisation?.childOrganisations

  const orderedAndFilteredOrganisations = useOrderedAndFilteredOrganisations(childOrganisations)

  if (isLoading) {
    return <Loader />
  }

  return orderedAndFilteredOrganisations?.map(org => (
    <OrganisationSummaryRow
      key={org.id}
      organisation={org}
      organisationId={org.id}
      alwaysOpen={orderedAndFilteredOrganisations.length === 1}
    />
  ))
}

const TagList = ({ organisationId, initialTags, questions }) => {
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    include: 'tags',
    enabled: !initialTags?.length,
  })

  const childTags = initialTags ?? organisation?.tags

  const orderedTags = React.useMemo(
    () => (childTags?.length > 0 ? _.orderBy(childTags, t => t.name, 'asc') : []),
    [organisation]
  )

  if (isLoading) {
    return <Loader />
  }

  return orderedTags?.map(t => (
    <TagSummaryRow key={t.id} tag={t} questions={questions} organisationId={organisationId} />
  ))
}

const CourseUnitsList = ({ organisationId, initialCourseUnits, questions }) => {
  const { sortFunction, sortBy } = useSummaryContext()
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    include: 'courseUnits',
    enabled: !initialCourseUnits?.length,
  })

  const childCourseUnits = initialCourseUnits ?? organisation?.courseUnits

  const orderedCourseUnits = React.useMemo(
    () => (childCourseUnits?.length > 0 ? _.orderBy(childCourseUnits, cu => sortFunction(cu.summary), sortBy[1]) : []),
    [organisation, sortBy[0], sortBy[1]]
  )

  if (isLoading) {
    return <Loader />
  }

  return orderedCourseUnits?.map(cu => <CourseUnitSummaryRow key={cu.id} courseUnit={cu} questions={questions} />)
}

const OrganisationResults = ({ summary, questions, linkComponent }) => {
  const { t } = useTranslation()

  const percent = summary ? ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed() : 0

  const feedbackResponsePercentage = summary ? (summary.data.feedbackResponsePercentage * 100).toFixed() : 0

  return (
    <>
      {questions.map(q => (
        <SummaryResultItem
          key={q.id}
          question={q}
          mean={summary ? summary.data.result[q.id]?.mean : 0}
          distribution={summary ? summary.data.result[q.id]?.distribution : {}}
          sx={styles.resultCell}
          component="div"
        />
      ))}
      <Tooltip title={t('common:feedbacksGivenRatio')} disableInteractive>
        <Typography variant="body2" sx={styles.countCell}>
          {summary ? summary.data.feedbackCount : '0'} / {summary ? summary.data.studentCount : '0'}
        </Typography>
      </Tooltip>
      <PercentageCell
        label={`${percent}%`}
        percent={percent}
        sx={styles.percentCell}
        tooltip={`${t('courseSummary:feedbackPercentage')}: ${percent}%`}
      />
      <PercentageCell
        label={`${feedbackResponsePercentage}%`}
        percent={feedbackResponsePercentage}
        sx={styles.percentCell}
        tooltip={`${t('courseSummary:feedbackResponsePercentage')}: ${feedbackResponsePercentage}%`}
      />
      {linkComponent}
    </>
  )
}

const OrganisationResultsLoader = ({ organisationId, initialOrganisation, questions }) => {
  const initialSummary = initialOrganisation?.summary
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    enabled: !initialSummary,
  })

  const access = useUserOrganisationAccessByCode(initialOrganisation?.code)

  if (isLoading) {
    return 'Ladataan...'
  }

  const summary = initialSummary ?? organisation?.summary

  const linkComponent = <OrganisationLink code={initialOrganisation?.code} access={access} />

  return <OrganisationResults summary={summary} questions={questions} linkComponent={linkComponent} />
}

export const OrganisationSummaryRow = ({ alwaysOpen = false, organisation: initialOrganisation, organisationId }) => {
  const { questions } = useSummaryContext()
  const { ref, inView } = useInView({
    triggerOnce: true,
  })
  const [isTransitioning, startTransition] = React.useTransition()
  const actuallyAlwaysOpen = alwaysOpen || initialOrganisation.initiallyExpanded
  const [storedIsOpen, setIsOpen] = React.useState(false)
  const isOpen = actuallyAlwaysOpen || storedIsOpen
  const [nextIsOpen, setNextIsOpen] = React.useState(isOpen)

  const indentLineColor = useRandomColor(initialOrganisation?.code ?? '')

  const tagsEnabled = TAGS_ENABLED.includes(initialOrganisation?.code)

  if (!alwaysOpen && !initialOrganisation) {
    return <Loader />
  }

  const label = <OrganisationLabel organisation={initialOrganisation} dates={null} />

  const handleOpenRow = () => {
    setNextIsOpen(!isOpen)
    startTransition(() => setIsOpen(!isOpen))
  }

  return (
    <Box ref={ref} display="flex" flexDirection="column" alignItems="stretch" gap="0.4rem">
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader openable={!alwaysOpen} label={label} isOpen={nextIsOpen} handleOpenRow={handleOpenRow} />
        {inView && (
          <OrganisationResultsLoader
            questions={questions}
            organisationId={organisationId}
            initialOrganisation={initialOrganisation}
          />
        )}
      </Box>
      {(isTransitioning || isOpen) && (
        <Box
          sx={{ pl: '2rem', borderLeft: `solid 3px ${indentLineColor}`, pb: '0.5rem' }}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          gap="0.4rem"
        >
          {isOpen && (
            <>
              <ChildOrganisationsList
                organisationId={organisationId}
                initialChildOrganisations={initialOrganisation?.childOrganisations}
              />
              {tagsEnabled && (
                <TagList
                  organisationId={organisationId}
                  initialTags={initialOrganisation?.tags}
                  questions={questions}
                />
              )}
              <CourseUnitsList
                organisationId={organisationId}
                initialCourseUnits={initialOrganisation?.courseUnits}
                questions={questions}
              />
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

export const TeacherOrganisationSummaryRow = ({ organisation, questions }) => {
  const { sortBy, sortFunction, showSeparateOrganisationCourses } = useSummaryContext()
  const [isOpen, setIsOpen] = React.useState(true)

  const indentLineColor = useRandomColor(organisation?.code ?? '')

  const label = <OrganisationLabel organisation={organisation} dates={null} />

  const orderedCourseUnits = React.useMemo(
    () =>
      organisation?.courseUnits?.length > 0
        ? _.orderBy(organisation.courseUnits, cu => sortFunction(cu.summary), sortBy[1]).filter(
            cu => showSeparateOrganisationCourses || !cu.separateOrganisation
          )
        : [],
    [organisation, sortBy[0], sortBy[1], showSeparateOrganisationCourses]
  )

  const access = useUserOrganisationAccessByCode(organisation?.code)

  const linkComponent = <OrganisationLink code={organisation?.code} access={access} />

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="0.4rem"
      pt={isOpen ? '0.5rem' : 0}
      sx={{ transition: 'padding-top 0.2s ease-out' }}
    >
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader openable label={label} isOpen={isOpen} handleOpenRow={() => setIsOpen(!isOpen)} />
        <OrganisationResults summary={organisation.summary} questions={questions} linkComponent={linkComponent} />
      </Box>
      {isOpen && (
        <Box
          sx={{ pl: '2rem', borderLeft: `solid 3px ${indentLineColor}`, pb: '0.5rem' }}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          gap="0.4rem"
        >
          {orderedCourseUnits.map(cu => (
            <CourseUnitSummaryRow key={cu.id} courseUnit={cu} questions={questions} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export const SorterRow = () => {
  const { t, i18n } = useTranslation()
  const { dateRange, setDateRange, option, setOption, questions } = useSummaryContext()

  const handleChangeTimeRange = nextDateRange => {
    setDateRange(nextDateRange)
  }

  const filterComponent = (
    <YearSemesterSelector
      value={dateRange ?? { start: new Date(), end: new Date() }}
      onChange={handleChangeTimeRange}
      option={option}
      setOption={setOption}
    />
  )

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={filterComponent} />
      {questions.map(q => (
        <Sort
          key={q.id}
          field={q.id}
          label={getLanguageValue(q.data.label, i18n.language)}
          width={styles.resultCell.minWidth}
        />
      ))}
      <Sort field="feedbackCount" label={t('courseSummary:feedbackCount')} width={styles.countCell.width} />
      <Sort field="feedbackPercentage" label={t('courseSummary:feedbackPercentage')} width={styles.percentCell.width} />
      <Sort
        field="feedbackResponsePercentage"
        label={t('courseSummary:feedbackResponsePercentage')}
        width={styles.percentCell.width}
      />
    </Box>
  )
}
