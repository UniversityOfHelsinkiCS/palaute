import { Box } from '@mui/material'
import React from 'react'
import { useInView } from 'react-intersection-observer'
import { orderBy } from 'lodash-es'
import RowHeader from './RowHeader'
import { TAGS_ENABLED } from '../../../util/common'
import useRandomColor from '../../../hooks/useRandomColor'
import { useSummaryContext } from '../context'
import { CourseUnitsList, Loader, SummaryResultElements } from './SummaryRow'
import { useSummaries } from '../api'
import { useOrderedAndFilteredOrganisations } from '../utils'
import { OrganisationLabel, TagLabel } from './Labels'
import { useUserOrganisationAccessByCode } from '../../../hooks/useUserOrganisationAccess'
import { OrganisationLink } from './OrganisationLink'

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

const TagList = ({ organisationId, initialTags, questions }) => {
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    include: 'tags',
    enabled: !initialTags?.length,
  })

  const childTags = initialTags ?? organisation?.tags

  const orderedTags = React.useMemo(
    () => (childTags?.length > 0 ? orderBy(childTags, t => t.name, 'asc') : []),
    [organisation]
  )

  if (isLoading) {
    return <Loader />
  }

  return orderedTags?.map(t => (
    <TagSummaryRow key={t.id} tag={t} questions={questions} organisationId={organisationId} />
  ))
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

const OrganisationSummaryRow = ({
  alwaysOpen = false,
  organisation: initialOrganisation,
  organisationId,
  startDate,
  endDate,
}) => {
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
                startDate={startDate}
                endDate={endDate}
              />
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

export default OrganisationSummaryRow
