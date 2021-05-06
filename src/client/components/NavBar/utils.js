import { inProduction } from '../../../config'
import { clearHeaders } from '../../util/mockHeaders'
import apiClient from '../../util/apiClient'
import { ADMINS } from '../../util/common'

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

export const isAdmin = (user) => ADMINS.includes(user?.username)
