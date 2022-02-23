import axios from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction, inE2EMode } from './common'

const apiClient = axios.create({ baseURL: `${basePath}/api` })

const getNoadUrl = (url) => `/noad${url}`

apiClient.interceptors.request.use((config) => {
  const defaultHeaders = inProduction && !inE2EMode ? {} : getHeaders()
  const token = localStorage.getItem('token')
  const tokenUser = localStorage.getItem('tokenUser')
  const organisationCode = config.code ? config.code : null
  const headers = { ...defaultHeaders, token, tokenUser, organisationCode }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // id
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs

  const url = token ? getNoadUrl(config.url) : config.url

  const newConfig = { ...config, headers, url }

  return newConfig
})

export default apiClient
