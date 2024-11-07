import { useQuery } from 'react-query'
import apiClient from '../../util/apiClient'

export const useOrganisationCourseSearch = (
  organisationCode: string | null,
  filterValue: string,
  startDate: Date | null,
  endDate: Date | null
) => {
  const queryFn = async () => {
    let url = `/organisations/${organisationCode}/courses?filter=${filterValue}`
    if (startDate && endDate) {
      url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    }
    const { data } = await apiClient.get(url)
    return data
  }

  const { data, ...rest } = useQuery(
    [
      'organisationCourseSearch',
      organisationCode,
      filterValue,
      startDate,
      endDate,
    ],
    queryFn,
    {
      enabled: filterValue.length > 1,
    }
  )

  console.log(data)

  return { data, ...rest }
}
