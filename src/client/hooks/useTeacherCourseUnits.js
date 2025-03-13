import { sortBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'
import { getLanguageValue } from '../util/languageUtils'

const defaultCacheTime = 900000

const useTeacherCourseUnits = (options = {}) => {
  const { i18n } = useTranslation()

  const queryKey = 'teacherCourseUnits'

  const queryFn = async () => {
    const { data } = await apiClient.get('/course-units/responsible')

    return sortBy(data, cu => getLanguageValue(cu.name, i18n.language))
  }

  const { data: courseUnits, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { courseUnits, ...rest }
}

export default useTeacherCourseUnits
