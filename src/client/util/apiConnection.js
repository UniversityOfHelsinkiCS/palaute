import axios from 'axios'
import { getHeaders } from './mockHeaders'
import { basePath, inProduction } from './common'

/**
 * ApiConnection simplifies redux usage
 */

export const getAxios = axios.create({ baseURL: `${basePath}/api` })

getAxios.interceptors.request.use((config) => {
  const defaultHeaders = !inProduction ? getHeaders() : {}
  const headers = { ...defaultHeaders }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // uid
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs
  const newConfig = { ...config, headers }
  return newConfig
})

export const callApi = async (url, method = 'get', data) => {
  const defaultHeaders = !inProduction ? getHeaders() : {}
  const headers = { ...defaultHeaders }

  const adminLoggedInAs = localStorage.getItem('adminLoggedInAs') // uid
  if (adminLoggedInAs) headers['x-admin-logged-in-as'] = adminLoggedInAs
  console.log('path', url)
  return getAxios({
    method,
    url,
    data,
    headers,
  })
}

export const x = () => true