import { PushPin, PushPinOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { orderBy } from 'lodash-es'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'

import useRandomColor from '../../../hooks/useRandomColor'
import { useUserOrganisationAccessByCode } from '../../../hooks/useUserOrganisationAccess'
import { focusIndicatorStyle } from '../../../util/accessibility'
import { TAGS_ENABLED } from '../../../util/common'
import { useSummaries, usePinnedOrganisations, usePinOrganisationMutation, useUnpinOrganisationMutation } from '../api'
import { useSummaryContext } from '../context'
import { useOrderedAndFilteredOrganisations } from '../utils'
import { OrganisationLabel, TagLabel } from './Labels'
import { OrganisationLink } from './OrganisationLink'
import RowHeader from './RowHeader'
import { CourseUnitsList, Loader, SummaryResultElements } from './SummaryRow'

export const getOrganisationTableButtonId = organisationId => `organisation-table-button-${organisationId}`

const ChildOrganisationsList = ({ organisationId, initialChildOrganisations, startDate, endDate, noPins = false }) => {
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
      startDate={startDate}
      endDate={endDate}
      noPins={noPins}
    />
  ))
}

const TagSummaryRow = ({ tag, questions, organisationId, startDate, endDate }) => {
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
          {isOpen && (
            <CourseUnitsList
              organisationId={organisationId}
              questions={questions}
              tagId={tag.id}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </Box>
      )}
    </Box>
  )
}

const TagList = ({ organisationId, initialTags, questions, startDate, endDate }) => {
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
    <TagSummaryRow
      key={t.id}
      tag={t}
      questions={questions}
      organisationId={organisationId}
      startDate={startDate}
      endDate={endDate}
    />
  ))
}

const OrganisationResultsLoader = ({ organisationId, initialOrganisation, questions, dateRange }) => {
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

  const linkComponent = <OrganisationLink code={initialOrganisation?.code} access={access} dateRange={dateRange} />

  return (
    <>
      <SummaryResultElements summary={summary} questions={questions} />
      {linkComponent}
    </>
  )
}

export const PinButton = ({ organisation, tableView }) => {
  const { t } = useTranslation()
  const { pinnedOrganisations } = usePinnedOrganisations()
  const pinMutation = usePinOrganisationMutation()
  const unpinMutation = useUnpinOrganisationMutation()
  const [tooltipOpen, setTooltipOpen] = React.useState(false)

  const isPinned = pinnedOrganisations.some(o => o?.id === organisation?.id)
  const isMutating = pinMutation.isPending || unpinMutation.isPending

  const handleClick = e => {
    e.stopPropagation()
    if (isMutating) return
    // workaround for MUI bug where tooltip stays open if element position shifts
    setTooltipOpen(false)
    if (isPinned) {
      unpinMutation.mutate(organisation?.id)
    } else {
      pinMutation.mutate(organisation)
    }

    setTimeout(() => {
      const target = document.getElementById(getOrganisationTableButtonId(organisation?.id))

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        target.focus()
      }
    }, 100)
  }

  return (
    <Tooltip
      title={t(isPinned ? 'courseSummary:unpinOrganisation' : 'courseSummary:pinOrganisation')}
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
    >
      <span style={{ display: 'flex', alignItems: 'center' }} aria-label={undefined}>
        <IconButton
          onClick={handleClick}
          disabled={isMutating}
          size={tableView ? 'large' : 'medium'}
          sx={{
            color: tableView ? 'primary.main' : 'text.secondary',
            m: 0.5,
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            ...focusIndicatorStyle(),
          }}
          aria-label={t(isPinned ? 'courseSummary:unpinOrganisation' : 'courseSummary:pinOrganisation')}
          disableRipple
        >
          {isPinned ? (
            <PushPin fontSize={tableView ? 'medium' : 'small'} />
          ) : (
            <PushPinOutlined fontSize={tableView ? 'medium' : 'small'} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  )
}

const OrganisationSummaryRow = ({
  alwaysOpen = false,
  organisation: initialOrganisation,
  organisationId,
  startDate,
  endDate,
  showPinButton = true,
  noPins = false,
}) => {
  const { questions, dateRange } = useSummaryContext()
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
        <RowHeader
          openable={!alwaysOpen}
          label={label}
          isOpen={nextIsOpen}
          handleOpenRow={handleOpenRow}
          beforeContent={showPinButton && !noPins && <PinButton organisation={initialOrganisation} />}
        />
        {inView && (
          <OrganisationResultsLoader
            questions={questions}
            organisationId={organisationId}
            initialOrganisation={initialOrganisation}
            dateRange={dateRange}
          />
        )}
      </Box>
      {(isTransitioning || isOpen) && (
        <Box
          sx={{ pl: '1.5rem', borderLeft: `solid 3px ${indentLineColor}`, pb: '0.5rem' }}
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
                startDate={startDate}
                endDate={endDate}
                noPins={noPins}
              />
              {tagsEnabled && (
                <TagList
                  organisationId={organisationId}
                  initialTags={initialOrganisation?.tags}
                  questions={questions}
                  startDate={startDate}
                  endDate={endDate}
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
