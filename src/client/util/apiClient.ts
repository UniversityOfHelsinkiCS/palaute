import axios, { AxiosHeaders } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction, inE2EMode } from './common'

const apiClient = axios.create({ baseURL: `${basePath}/api` })
const getNoadUrl = (url?: string) => `/noad${url}`

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const defaultHeaders = inProduction && !inE2EMode ? {} : getHeaders()
  const token = sessionStorage.getItem('token')
  const tokenUser = sessionStorage.getItem('tokenUser')
  const headers = new AxiosHeaders({ ...defaultHeaders, token, tokenUser })

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // id
  if (adminLoggedInAs) headers.set('x-admin-logged-in-as', adminLoggedInAs)

  const url = token ? getNoadUrl(config.url) : config.url

  const newConfig = { ...config, headers, url }

  return newConfig
})

export default apiClient
