import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useProgrammeOpenQuestions = (code, options = {}) => {
  const queryKey = ['programmeOpenQuestions', code]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${code}/open`)

    return data
  }

  const { data: codesWithIds, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { codesWithIds, ...rest }
}

export default useProgrammeOpenQuestions
