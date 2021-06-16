import axios from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction, inE2EMode } from './common'

const apiClient = axios.create({ baseURL: `${basePath}/api` })

apiClient.interceptors.request.use((config) => {
  const defaultHeaders = inProduction && !inE2EMode ? {} : getHeaders()
  const headers = { ...defaultHeaders }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // id
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs
  const newConfig = { ...config, headers }
  return newConfig
})

export default apiClient
