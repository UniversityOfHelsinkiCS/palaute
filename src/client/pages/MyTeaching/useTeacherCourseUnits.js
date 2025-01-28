import { orderBy, sortBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'

import apiClient from '../../util/apiClient'
import { getLanguageValue } from '../../util/languageUtils'

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

    return orderBy(data, orderFn, 'asc')
  }

  const { data: courseUnits, ...rest } = useQuery(
    ['teacherCourseUnits', params.status, params.startDate, params.endDate],
    queryFn,
    {
      cacheTime: defaultCacheTime,
      staleTime: defaultCacheTime,
      ...options,
    }
  )

  return { courseUnits, ...rest }
}

export const useTeacherOrganisatioSurveys = (params, options = {}) => {
  const { i18n } = useTranslation()

  const queryFn = async () => {
    const { data } = await apiClient.get('/my-teaching/courses', { params: { ...params, isOrganisationSurvey: true } })

    return sortBy(data, cu => getLanguageValue(cu.name, i18n.language))
  }

  const { data: courseUnits, ...rest } = useQuery(
    ['teacherOrgSurveys', params.status, params.startDate, params.endDate],
    queryFn,
    {
      cacheTime: defaultCacheTime,
      staleTime: defaultCacheTime,
      ...options,
    }
  )

  return { courseUnits, ...rest }
}
