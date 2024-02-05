import React from 'react'
import _ from 'lodash'
import { blueGrey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Box, Typography, Tooltip, Skeleton } from '@mui/material'
import { useSummaries } from './api'
import { getLanguageValue } from '../../util/languageUtils'
import SummaryResultItem from '../../components/SummaryResultItem/SummaryResultItem'
import { FeedbackTargetLabel, CourseUnitLabel, OrganisationLabel, TagLabel } from './components/Labels'
import PercentageCell from './components/PercentageCell'
import useRandomColor from '../../hooks/useRandomColor'
import { useOrderedAndFilteredOrganisations } from './utils'
import { useSummaryContext } from './context'
import { OrganisationLink } from './components/OrganisationLink'
import { useUserOrganisationAccessByCode } from '../../hooks/useUserOrganisationAccess'
import { TAGS_ENABLED } from '../../util/common'
import RowHeader from './components/RowHeader'
import CensoredCount from './components/CensoredCount'
import FeedbackResponseIndicator from './components/FeedbackResponseIndicator'

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
        <SummaryResultElements summary={tag.summary} questions={questions} />
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

const SummaryResultElements = ({ questions, summary, feedbackResponseIndicator }) => {
  const { t } = useTranslation()
  const data = summary?.data
  const percent = data ? ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed() : '-'
  const feedbackResponsePercentage = data ? (summary.data.feedbackResponsePercentage * 100).toFixed() : '-'

  return (
    <>
      {questions.map(q => (
        <SummaryResultItem
          key={q.id}
          question={q}
          mean={data?.result?.[q.id]?.mean}
          distribution={data ? data.result[q.id]?.distribution : {}}
          sx={styles.resultCell}
          component="div"
        />
      ))}
      <Tooltip title={t('common:feedbacksGivenRatio')} disableInteractive>
        <Typography variant="body2" sx={styles.countCell}>
          {data ? `${data.feedbackCount} / ${data.studentCount}` : '-'}
        </Typography>
      </Tooltip>
      <PercentageCell
        label={`${percent}%`}
        percent={percent}
        sx={styles.percentCell}
        tooltip={`${t('courseSummary:feedbackPercentage')}: ${percent}%`}
      />
      {feedbackResponseIndicator ? (
        <Box sx={styles.percentCell}>{feedbackResponseIndicator}</Box>
      ) : (
        <PercentageCell
          label={`${feedbackResponsePercentage}%`}
          percent={feedbackResponsePercentage}
          sx={styles.percentCell}
          tooltip={`${t('courseSummary:feedbackResponsePercentage')}: ${feedbackResponsePercentage}%`}
        />
      )}
      {/* <Box sx={styles.countCell}> // @TODO access check to show hidden count
        {Boolean(data?.hiddenCount) && <CensoredCount count={data.hiddenCount} />}
      </Box> */}
    </>
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

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={label} link={link} />
      <SummaryResultElements summary={summary} questions={questions} />
    </Box>
  )
}

const FeedbackTargetSummaryRow = ({ feedbackTarget, questions }) => {
  const { i18n } = useTranslation()
  const { summary } = feedbackTarget.courseRealisation

  const notGivenStatus = Date.parse(feedbackTarget.closesAt) > Date.now() ? 'OPEN' : 'NONE'
  const responseStatus = summary?.data?.feedbackResponsePercentage === 1 ? 'GIVEN' : notGivenStatus

  const feedbackResponseIndicator = (
    <FeedbackResponseIndicator status={responseStatus} currentFeedbackTargetId={feedbackTarget.id} />
  )

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={<FeedbackTargetLabel feedbackTarget={feedbackTarget} language={i18n.language} />} />
      <SummaryResultElements
        summary={summary}
        questions={questions}
        feedbackResponseIndicator={feedbackResponseIndicator}
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

const OrganisationResultsLoader = ({ organisationId, initialOrganisation, questions }) => {
  const initialSummary = initialOrganisation?.summary
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    enabled: !initialSummary,
  })

  const access = useUserOrganisationAccessByCode(initialOrganisation?.code)

  if (isLoading) {
    return <Loader />
  }

  const summary = initialSummary ?? organisation?.summary

  const linkComponent = <OrganisationLink code={initialOrganisation?.code} access={access} />

  return (
    <>
      <SummaryResultElements summary={summary} questions={questions} />
      {linkComponent}
    </>
  )
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
        <SummaryResultElements summary={organisation.summary} questions={questions} />
        {linkComponent}
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

export const CourseUnitGroupSummaryRow = ({ courseUnitGroup, questions }) => {
  const { i18n } = useTranslation()

  const label = (
    <CourseUnitLabel name={getLanguageValue(courseUnitGroup.name, i18n.language)} code={courseUnitGroup.courseCode} />
  )

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="0.4rem"
      pt="0.5rem"
      sx={{ transition: 'padding-top 0.2s ease-out' }}
    >
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader label={label} />
        <SummaryResultElements summary={courseUnitGroup.summary} questions={questions} />
      </Box>
      <Box
        sx={{ pl: '2rem', borderLeft: `solid 3px ${blueGrey[100]}`, pb: '0.5rem' }}
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap="0.4rem"
      >
        {courseUnitGroup.feedbackTargets.map(fbt => (
          <FeedbackTargetSummaryRow key={fbt.id} feedbackTarget={fbt} questions={questions} />
        ))}
      </Box>
    </Box>
  )
}
