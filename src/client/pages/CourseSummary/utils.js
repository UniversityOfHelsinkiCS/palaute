import { orderBy } from 'lodash-es'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import { useSummaries } from './api'
import { useSummaryContext } from './context'

export const useOrderedAndFilteredOrganisations = organisations => {
  const { showSummariesWithNoFeedback, sortBy, sortFunction } = useSummaryContext()
  const filteredAndOrderedOrganisations = useMemo(
    () =>
      !organisations
        ? []
        : orderBy(
            showSummariesWithNoFeedback ? organisations : organisations.filter(org => !!org.summary),
            [org => sortFunction(org.summary), org => org?.code],
            [sortBy[1], 'asc']
          ),
    [showSummariesWithNoFeedback, organisations, sortBy[0], sortBy[1]]
  )

  return filteredAndOrderedOrganisations
}

export const useSummary = organisation => {
  const initialSummary = organisation?.summary

  const { organisation: organisationWithSummary, isLoading } = useSummaries({
    entityId: organisation?.id,
    enabled: !initialSummary && Boolean(organisation),
  })

  const summary = initialSummary ?? organisationWithSummary?.summary

  return { summary: summary ?? null, isLoading: isLoading ?? false }
}

export const useChildOrganisations = organisation => {
  const initialChildOrganisations = organisation?.childOrganisations

  const { organisation: organisationWithChildren, isLoading } = useSummaries({
    entityId: organisation?.id,
    include: 'childOrganisations',
    enabled: !initialChildOrganisations?.length && Boolean(organisation),
  })

  const childOrganisations =
    initialChildOrganisations?.length > 0
      ? initialChildOrganisations
      : (organisationWithChildren?.childOrganisations ?? [])
  const orderedAndFilteredOrganisations = useOrderedAndFilteredOrganisations(childOrganisations)

  return { childOrganisations: orderedAndFilteredOrganisations, isLoading: isLoading ?? false }
}

export const useTags = (organisation, tagsEnabled) => {
  const { i18n } = useTranslation()

  const initialTags = organisation?.tags

  const { organisation: organisationWithTags, isLoading } = useSummaries({
    entityId: organisation?.id,
    include: 'tags',
    enabled: !initialTags?.length && tagsEnabled && Boolean(organisation),
  })

  const childTags = initialTags?.length > 0 ? initialTags : (organisationWithTags?.tags ?? [])

  const orderedTags = useMemo(
    () => (childTags?.length > 0 ? orderBy(childTags, t => getLanguageValue(t.name, i18n.language), 'asc') : []),
    [childTags, i18n.language]
  )

  return { tags: orderedTags, isLoading: isLoading ?? false }
}

export const useOrderedCourseUnits = ({ organisation, tagId }) => {
  const { sortFunction, sortBy } = useSummaryContext()
  const initialCourseUnits = organisation?.courseUnits

  const { organisation: organisationWithCourseUnits, isLoading } = useSummaries({
    entityId: organisation?.id,
    include: 'courseUnits',
    enabled: !initialCourseUnits?.length && Boolean(organisation),
    tagId,
  })

  const courseUnits =
    initialCourseUnits?.length > 0 ? initialCourseUnits : (organisationWithCourseUnits?.courseUnits ?? [])

  const orderedCourseUnits = useMemo(
    () =>
      courseUnits?.length > 0
        ? orderBy(courseUnits, [cu => sortFunction(cu.summary), cu => cu.code], [sortBy[1], 'asc'])
        : [],
    [courseUnits, sortFunction, sortBy[0], sortBy[1]]
  )

  return { courseUnits: orderedCourseUnits, isLoading: isLoading ?? false }
}
