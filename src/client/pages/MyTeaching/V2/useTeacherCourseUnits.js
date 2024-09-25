import { sortBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'

import apiClient from '../../../util/apiClient'
import { getLanguageValue } from '../../../util/languageUtils'

const defaultCacheTime = 900000

export const useTeacherCourseUnits = (params, options = {}) => {
  const { i18n } = useTranslation()

  const queryFn = async () => {
    const { data } = await apiClient.get('/my-teaching/courses', { params })

    return sortBy(data, cu => getLanguageValue(cu.name, i18n.language))
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
