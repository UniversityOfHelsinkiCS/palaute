import axios from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction } from './common'

const apiClient = axios.create({ baseURL: `${basePath}/api` })

apiClient.interceptors.request.use((config) => {
  const defaultHeaders = !inProduction ? getHeaders() : {}
  const headers = { ...defaultHeaders }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // uid
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs
  const newConfig = { ...config, headers }
  return newConfig
})

export default apiClient
