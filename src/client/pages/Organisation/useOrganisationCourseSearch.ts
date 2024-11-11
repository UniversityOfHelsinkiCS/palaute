import { useQuery } from 'react-query'
import apiClient from '../../util/apiClient'

interface UseOrganisationCourseSearchOptions {
  organisationCode: string
  search?: string
  startDate?: Date
  endDate?: Date
}

export const useOrganisationCourseSearch = ({
  organisationCode,
  search,
  startDate,
  endDate,
}: UseOrganisationCourseSearchOptions) => {
  const queryFn = async () => {
    let url = `/organisations/${organisationCode}/courses?filter=${search}`
    if (startDate && endDate) {
      url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    }
    const { data } = await apiClient.get(url)
    return data
  }

  const { data, ...rest } = useQuery(
    ['organisationCourseSearch', organisationCode, search, startDate, endDate],
    queryFn
  )

  return { data, ...rest }
}
