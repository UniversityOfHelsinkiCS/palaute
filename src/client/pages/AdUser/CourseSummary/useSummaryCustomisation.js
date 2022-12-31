const { useMutation, useQuery } = require('react-query')
const { default: apiClient } = require('../../../util/apiClient')
const { default: queryClient } = require('../../../util/queryClient')

const useSummaryCustomisation = () => {
  const queryKey = ['summaryCustomisation']

  const queryFn = async () => {
    const res = await apiClient.get('/course-summaries/customisation')
    return res.data?.data
  }

  const { data: customisation, isLoading } = useQuery(queryKey, queryFn, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const mutationFn = async customisation => {
    const res = await apiClient.put(`/course-summaries/customisation`, {
      customisation,
    })
    return res.data
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: response => {
      const { data } = response
      if (data) {
        queryClient.setQueryData(queryKey, data)
        queryClient.refetchQueries(['organisationSummaries'])
      }
    },
    onError: () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  return { customisation, isLoading, mutation }
}

export default useSummaryCustomisation
