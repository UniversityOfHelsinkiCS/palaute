import { useQuery } from '@tanstack/react-query'
import type { GetBannersResponse } from '@common/types/banner'
import apiClient from '../util/apiClient'

const useBanners = () => {
  const queryKey = 'banners'
  const queryFn = async () => {
    const { data } = await apiClient.get<GetBannersResponse>('admin/banners')
    return data
  }

  const { data: banners, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
  })

  return { banners, ...rest }
}

export default useBanners
