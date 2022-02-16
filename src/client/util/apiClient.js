import axios from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction, inE2EMode } from './common'

const apiClient = axios.create({ baseURL: `${basePath}/api` })

const getNoadUrl = (url) => `/noad${url}`

apiClient.interceptors.request.use((config) => {
  const defaultHeaders = inProduction && !inE2EMode ? {} : getHeaders()
  const token = localStorage.getItem('token')
  const tokenUser = localStorage.getItem('tokenUser')
  const headers = { ...defaultHeaders, token, tokenUser }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // id
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs

  const url = token ? getNoadUrl(config.url) : config.url

  const newConfig = { ...config, headers, url }

  return newConfig
})

export default apiClient
