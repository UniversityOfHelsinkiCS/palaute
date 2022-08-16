import { inProduction } from '../../../config/config'
import { clearHeaders } from '../../util/mockHeaders'
import apiClient from '../../util/apiClient'

const devLogout = () => {
  clearHeaders()
  window.location.reload()
}

export const handleLogout = async () => {
  if (!inProduction) devLogout()

  const {
    data: { url },
  } = await apiClient.get('/logout')

  if (!url) return

  window.location.href = url
}
