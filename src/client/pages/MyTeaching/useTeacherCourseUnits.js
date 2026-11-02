import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'

import apiClient from '../../util/apiClient'
import { getLanguageValue } from '../../util/languageUtils'
import { courseUnitNeedsAttention } from './utils/utils'

const defaultCacheTime = 900000

const getOrderFnByStatus = status => {
  switch (status) {
    case 'active':
      return cu => cu.courseRealisations[0].feedbackTargets[0].opensAt
    case 'upcoming':
      return cu => cu.courseRealisations[0].startDate
    case 'ended':
      return cu => cu.courseRealisations[0].endDate
    default:
      return cu => cu.courseRealisations[0].feedbackTargets[0].opensAt
  }
}

export const useTeacherCourseUnits = (params, options = {}) => {
  const queryFn = async () => {
    const { data } = await apiClient.get('/my-teaching/courses', { params })

    const orderFn = getOrderFnByStatus(params.status)

    // Courses with an ongoing interim feedback, ongoing continuous feedback or a missing feedback response come first
    return orderBy(data, [courseUnitNeedsAttention, orderFn], ['desc', 'asc'])
  }

  const { data: courseUnits, ...rest } = useQuery({
    queryKey: ['teacherCourseUnits', params.status, params.startDate, params.endDate],
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { courseUnits, ...rest }
}

export const useTeacherOrganisatioSurveys = (params, options = {}) => {
  const { i18n } = useTranslation()

  const queryFn = async () => {
    const { data } = await apiClient.get('/my-teaching/courses', { params: { ...params, isOrganisationSurvey: true } })

    return orderBy(data, [courseUnitNeedsAttention, cu => getLanguageValue(cu.name, i18n.language)], ['desc', 'asc'])
  }

  const { data: courseUnits, ...rest } = useQuery({
    queryKey: ['teacherOrgSurveys', params.status, params.startDate, params.endDate],
    queryFn,
    ...options,
  })

  return { courseUnits, ...rest }
}
